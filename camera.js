var cameraURL = "http://dbrenn.com/webcam/camera.php";
var connection_id = "";
var imageURL = "";

var camera = {};
$.ajax({

    url: cameraURL+"?path=OpenCameraServer",
    data: { },
    success: function( data ) {
        connection_id = data.split('=')[1]
            connection_id = connection_id.replace(/(\r\n|\n|\r)/gm,"");
        imageURL = "http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetLiveImage?connection_id=" + connection_id;
        timedRefresh(100);
        if(debug){
            $( "#conn" ).html( "Connection id: " + connection_id + "<br />" + "Debug Links: <br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetLiveImage?connection_id=" + connection_id +"' >GetLiveImage</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetCameraServerInfo?connection_id=" + connection_id +"' >GetCameraServerInfo</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetNotice?timeout=1000&connection_id=" + connection_id +"' >GetNotice</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetCameraControl?connection_id=" + connection_id +"' >GetCameraControl</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/OperateCamera?pan=-2000&tilt=-900&zoom=2500&back_light=off&camera_id=1&connection_id=" + connection_id +"' >OperateCamera</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/OperateCameraOnScreen?pan=-100&tilt=100&connection_id=" + connection_id +"' >OperateCameraOnScreen</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetPanoramaList?connection_id=" + connection_id +"' >GetPanoramaList</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetVideoInfo?connection_id=" + connection_id +"' >GetVideoInfo</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetCameraInfo?connection_id=" + connection_id +"' >GetCameraInfo</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetPanoramaImage?connection_id=" + connection_id +"' >GetPanoramaImage</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/GetPresetList?language=English&character_set=ascii&connection_id=" + connection_id +"' >GetPresetList</a><br />"
                    + "<a href='http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/CloseCameraServer?connection_id=" + connection_id +"' >CloseCameraServer</a><br />");
            $( "#init-time" ).html("Session initialization timestamp: " + new Date().getTime());
        }
        setUpButton();
        getPresetList();
        connectionWatchdog();
    }
});

function setUpButton()
{
    $( "#control-cam" ).html( "<button>Take control</button>");
    $( "#control-cam button" ).on( "click", function( event ) {
        $.ajax({

            url: cameraURL+"?path=GetCameraControl" + encodeURIComponent("?connection_id="+connection_id),
            data: { },
            success: function( data ) {
                if(debug) $( "#debug" ).html( "take control button clicked: " + data + "|" + connection_id + cameraURL+"?path=GetCameraControl" + encodeURIComponent("?connection_id="+connection_id) + new Date().getTime());
            }
        });

    });
    $( "#countdown" ).html("");
};


var presetList = [];
function getPresetList()
{
    $.ajax({

        url: cameraURL+"?path=GetPresetList" + encodeURIComponent("?language=English&character_set=ascii&connection_id="+connection_id),
        data: { },
        success: function( data ) {
            var writePosition = 0;
            var curPosition = 0;
            $.each(data.split('\n'), function(index, line) {
                var line = line.replace(/(\r|\n)/gm,"");
                //console.log( index + ": " + line );
                var declaration = line.split('=');
                if(line=='')
                {
                    if(writePosition) curPosition++;
                    writePosition = 0;
                    //console.log( index + ": got blank line");
                }
                if(writePosition)
                {
                    //console.log( index + "---curPosition, declaration " + curPosition + ',' + declaration[1]);
                    presetList[curPosition][declaration[0]] = declaration[1];
                    //console.log( index + ": add to preset list: " + declaration[0] + "=" + declaration[1]);
                }

                if(declaration[0].substring(0,8)=='position')
                {
                    var name = declaration[1];
                    presetList[curPosition] = {};
                    presetList[curPosition]['name'] = name;
                    writePosition = 1;
                    //console.log( index + ": got position #" + curPosition + " name: " + declaration[1]);
                }
            });

        }
    });
};

var isActive = true;
var seqNumber = 1;
var haveControl = false;
function connectionWatchdog()
{
    $.ajax({
        url: cameraURL+"?path=GetNotice" + encodeURIComponent("?timeout=1800&connection_id="+connection_id+"&seq="+seqNumber),
        data: { }
    })
    .done( function( data ) {
        if(debug) console.log( "GetNotice?seq=" + seqNumber +": " + data + new Date().getTime());
        seqNumber++;
        var wait = false;
        var parsePosition = false;
        $.each(data.split('\n'), function(index, line) {
            var line = line.replace(/(\r|\n)/gm,"");
            if(line=="--- WebView Livescope Http Server Error ---")
            {
                isActive = false;
                destroyButton();
                return false; 
            }
            else if(line=="disabled_camera_control")
            {
                // disable the timer and reset take control button
                haveControl = false;
                $( "#slider-group" ).hide();
                $("#x").unbind();
                setUpButton();
            }
            else if(parsePosition)
            {
                    var declaration = line.split('=');
                    if(line==''){
                        return false;
                    }
                    else if(declaration['0'] == "pan")
                        camera.pan_current_value = parseInt(declaration[1]);
                    else if(declaration['0'] == "tilt")
                        camera.tilt_current_value = parseInt(declaration[1]);
                    else if(declaration['0'] == "zoom")
                        camera.zoom_current_value = parseInt(declaration[1]);

                    else
                        camera[declaration[0]] = declaration[1];
            }
            else if(line=="camera_operated_by_another_client")
            {
                parsePosition = true;
            }
            else if(wait)
            {
                var line = line.split('=');
                var wait_or_limit = line[0];
                var time_limit = line[1];
                var time_remaining = Math.ceil(parseInt(time_limit)/1000)+1;
                if(wait_or_limit == "wait_time")
                {
                    // wait
                    //console.log("waiting, time limit: " + time_limit + " remaining: " + time_remaining);
                    countdown("Waiting for control. Time remaining: ", time_remaining, $.noop);
                    $( "#control-cam" ).html( "");

                } else {
                    //console.log("waiting, time limit: " + time_limit + " remaining: " + time_remaining);
                    countdown("Remaining time for control of camera: ", time_remaining, controlTimeExpired);
                    setUpControl();
                }
                // break out of jquery .each loop
                return false; 

            }
            else if(line=="waiting_camera_control" || line=="enabled_camera_control")
            {
                wait = true;
            }
        });
        if(parsePosition && $("#zoom-slider").data('ui-slider'))
        {
            // update pan, tilt, and zoom sliders and values
            $( "#pan-slider" ).slider("option", "value", camera.pan_current_value );
            $( "#pan-slider-amount" ).val( $( "#pan-slider" ).slider( "value" ) );
            $( "#tilt-slider" ).slider("option", "value", camera.tilt_current_value );
            $( "#tilt-slider-amount" ).val( $( "#tilt-slider" ).slider( "value" ) );
            $( "#zoom-slider" ).slider("option", "value", zoom_max-camera.zoom_current_value );
            $( "#zoom-slider-amount" ).val( $( "#zoom-slider" ).slider( "value" ) );
            parsePosition = false;
        }
        if(isActive) setTimeout(connectionWatchdog, 0);
    })
    .fail( function() {
        isActive = false;
        destroyButton();
        //console.log( "GetNotice?seq=" + seqNumber +" failed " + new Date().getTime());
    });
};

function controlTimeExpired(){
    if(haveControl && isActive) $( "#countdown" ).html("You still have control of the camera.");
    else $( "#countdown" ).html("");
};

function countdown(str, time_remaining, finishedCallback)
{
    var counter = time_remaining;
    $( "#countdown" ).html(str + counter);
    var interval = setInterval(function() {
        counter--;
        $( "#countdown" ).html(str + counter);
        if (counter == 0 || isActive == false) {
            clearInterval(interval);
            $( "#countdown" ).html("");
            finishedCallback();
        }
    }, 1000);
};


// Close connection to server
$(window).on('beforeunload', function(){
    destroyButton();
    return 'Closing connection to server...'
});

function destroyButton()
{
    isActive = false;
    $( "#countdown" ).html("");
    $( "#control-cam" ).html("Time expired. Please refresh the page if you'd like to continue to control the camera.");
    $( "#slider-group" ).hide();
    $("#x").unbind();
    $.ajax({

        url: cameraURL+"?path=CloseCameraServer" + encodeURIComponent("?connection_id="+connection_id),
        data: { },
        success: function( data ) {
            $( "#debug" ).html( "Closed connection to camera server: " + data + "|" + connection_id + cameraURL+"?path=ClosecameraServer" + encodeURIComponent("?connection_id="+connection_id) + new Date().getTime());
        }
    });
    $(window).unbind('beforeunload');
    displayDisconnected();
}

var zoom_max;
function setUpControl()
{

    $( "#control-cam" ).html( "");
    haveControl = true;
    $.ajax({
        url: cameraURL+"?path=GetCameraInfo" + encodeURIComponent("?connection_id="+connection_id),
        data: { },
        success: function( data ) {
            $.each(data.split('\n'), function(index, line) {
                var line = line.replace(/(\r|\n)/gm,"");
                var declaration = line.split('=');
                if(line==''){
                    return false;
                }
                else
                {
                    camera[declaration[0]] = declaration[1];
                }
            })
            camera.pan_current_value = parseInt(camera.pan_current_value);
            camera.pan_left_limit = parseInt(camera.pan_left_limit);
            camera.pan_right_limit = parseInt(camera.pan_right_limit);
            camera.tilt_current_value = parseInt(camera.tilt_current_value);
            camera.tilt_up_limit = parseInt(camera.tilt_up_limit);
            camera.tilt_down_limit = parseInt(camera.tilt_down_limit);
            camera.zoom_current_value = parseInt(camera.zoom_current_value);
            camera.zoom_tele_limit = parseInt(camera.zoom_tele_limit);
            camera.zoom_wide_limit = parseInt(camera.zoom_wide_limit);

            var pan_min = camera.pan_left_limit;
            var pan_max = camera.pan_right_limit;
            var pan_val = camera.pan_current_value;
            var tilt_min = camera.tilt_down_limit;
            var tilt_max = camera.tilt_up_limit;
            var tilt_val = camera.tilt_current_value;
            var zoom_min = camera.zoom_tele_limit;
            zoom_max = camera.zoom_wide_limit;
            var zoom_val = camera.zoom_current_value;

            $( "#tilt-slider" ).slider({
                orientation: "vertical",
                range: "min",
                min: tilt_min,
                max: tilt_max,
                value: tilt_val,
                slide: function( event, ui ) {
                    $( "#tilt-slider-amount" ).val( ui.value );
                    camera.tilt_current_value = ui.value
                        if(debug) console.log("tilt slider: "+cameraURL+"?path=OperateCamera" + "?pan="+camera.pan_current_value+"&tilt="+camera.tilt_current_value+"&zoom="+camera.zoom_current_value+"&camera_id=1&connection_id="+connection_id);
                        $.ajax({
                            url: cameraURL+"?path=OperateCamera" + encodeURIComponent("?pan="+camera.pan_current_value+"&tilt="+camera.tilt_current_value+"&zoom="+camera.zoom_current_value+"&camera_id=1&connection_id="+connection_id),
                            data: { },
                            success: function( data ) {
                                $( "#debug" ).html( "tilt slider changed: " + camera.tilt_current_value + " data: "+ data + "|" + connection_id + "dock" + new Date().getTime());
                            }
                        });

                }
            });
            $( "#tilt-slider-amount" ).val( $( "#tilt-slider" ).slider( "value" ) );
            $( "#zoom-slider" ).slider({
                orientation: "vertical",
                range: "min",
                min: zoom_min,
                max: zoom_max,
                value: zoom_max-zoom_val,
                slide: function( event, ui ) {
                    $( "#zoom-slider-amount" ).val( ui.value );
                    camera.zoom_current_value = zoom_max-ui.value
                        if(debug) console.log("zoom slider: "+cameraURL+"?path=OperateCamera" + "?pan="+camera.pan_current_value+"&tilt="+camera.tilt_current_value+"&zoom="+camera.zoom_current_value+"&camera_id=1&connection_id="+connection_id);
                        $.ajax({
                            url: cameraURL+"?path=OperateCamera" + encodeURIComponent("?pan="+camera.pan_current_value+"&tilt="+camera.tilt_current_value+"&zoom="+camera.zoom_current_value+"&camera_id=1&connection_id="+connection_id),
                            data: { },
                            success: function( data ) {
                                $( "#debug" ).html( "zoom slider changed: " + camera.zoom_current_value + " data: "+ data + "|" + connection_id + "dock" + new Date().getTime());
                            }
                        });

                }
            });
            $( "#zoom-slider-amount" ).val( $( "#zoom-slider" ).slider( "value" ) );
            $( "#pan-slider" ).slider({
                orientation: "horizontal",
                range: "min",
                min: pan_min,
                max: pan_max,
                value: pan_val,
                slide: function( event, ui ) {
                    $( "#pan-slider-amount" ).val( ui.value );
                    camera.pan_current_value = ui.value
                        if(debug) console.log("pan slider: "+cameraURL+"?path=OperateCamera" + "?pan="+camera.pan_current_value+"&tilt="+camera.tilt_current_value+"&zoom="+camera.zoom_current_value+"&camera_id=1&connection_id="+connection_id);
                        $.ajax({
                            url: cameraURL+"?path=OperateCamera" + encodeURIComponent("?pan="+camera.pan_current_value+"&tilt="+camera.tilt_current_value+"&zoom="+camera.zoom_current_value+"&camera_id=1&connection_id="+connection_id),
                            data: { },
                            success: function( data ) {
                                $( "#debug" ).html( "pan slider changed: " + camera.pan_current_value + " data: "+ data + "|" + connection_id + "dock" + new Date().getTime());
                            }
                        });

                }
            });
            $( "#pan-slider-amount" ).val( $( "#pan-slider" ).slider( "value" ) );
            $( "#slider-group" ).show();

            // set up canvas click to pan/tilt
            $("#x").on('click', function(e){
                var pos = getMouseClickPosition(canvas, e);
                if(debug) console.log("clicked on canvas at: " + pos.x + "," + pos.y);

                // pan/tilt arguments expect +/- percentage (0-100) to move camera
                var pan = Math.floor((2*pos.x-canvas.width) * 100 / canvas.width);
                var tilt = Math.floor(-(2*pos.y-canvas.height) * 100 / canvas.height);
                if(debug) console.log("new pan,tilt,zoom: " + pan +","+ tilt +","+ camera.zoom_current_value);

                // call OperateCameraOnScreen method
                $.ajax({
                    url: cameraURL+"?path=OperateCameraOnScreen" + encodeURIComponent("?pan="+pan+"&tilt="+tilt+"&connection_id="+connection_id),
                    data: { },
                    success: function( data ) {
                        if(debug) $( "#debug" ).html( "canvas clicked" + data + "|" + connection_id + "dock" + new Date().getTime());
                    }
                });


            });
        }
    });
    $.each(presetList, function(index, location) {
        $( "#control-cam" ).append( "<button id='button" + index +"'>" + location.name +"</button>");
        $( "#button"+index ).on( "click", function( event ) {
            $.ajax({
                url: cameraURL+"?path=OperateCamera" + encodeURIComponent("?pan="+location.pan+"&tilt="+location.tilt+"&zoom="+location.zoom+"&back_light="+location.back_light+"&camera_id=1&connection_id="+connection_id),
                data: { },
                success: function( data ) {
                    camera.pan_current_value = location.pan;
                    camera.tilt_current_value = location.tilt;
                    camera.zoom_current_value = location.zoom;
                    // update pan,tilt, and zoom sliders and values
                    $( "#pan-slider" ).slider("option", "value", camera.pan_current_value );
                    $( "#pan-slider-amount" ).val( $( "#pan-slider" ).slider( "value" ) );
                    $( "#tilt-slider" ).slider("option", "value", camera.tilt_current_value );
                    $( "#tilt-slider-amount" ).val( $( "#tilt-slider" ).slider( "value" ) );
                    $( "#zoom-slider" ).slider("option", "value", zoom_max-camera.zoom_current_value );
                    $( "#zoom-slider-amount" ).val( $( "#zoom-slider" ).slider( "value" ) );
                    if(debug) $( "#debug" ).html( "button "+index+" clicked" + data + "|" + connection_id + "dock" + new Date().getTime());
                }
            });

        });
    });
};

// get mouse position relative to canvas
function getMouseClickPosition(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}


function displayDisconnected()
{
    // write canvas time out
    context.font="60px Verdana";
    context.textAlign="center";
    context.strokeStyle="black";
    context.strokeText("disconnected", canvas.width/2, canvas.height/2);
    context.fillStyle="white";
    context.fillText("disconnected", canvas.width/2, canvas.height/2);
    $( "#control-cam" ).html("<p>Please refresh page to continue viewing webcam</p>");
};

var canvas, context, img, disconnected;
var retry;
var retryCount = 0;
function timedRefresh(timeoutPeriod)
{
    canvas = document.getElementById("x");
    context = canvas.getContext("2d");
    img = new Image();
    img.src = imageURL + "&timeout=" + new Date().getTime();
    img.onload = function() {
        if(isActive)
        {
            context.drawImage(img, 0, 0);
            var time = new Date ( );
            var timestamp = time.getHours() + ":" + ("0" + time.getMinutes()).slice(-2) + "." + ("0"+time.getSeconds()).slice(-2);
            context.font="12px Verdana";
            context.strokeStyle="black";
            context.strokeText(timestamp, 0, canvas.height);
            context.fillStyle="white";
            context.fillText(timestamp, 0, canvas.height);

            if(debug) $( "#server-data" ).html("Most recent image timestamp: " + new Date().getTime());
            setTimeout(function() {timedRefresh(timeoutPeriod)},timeoutPeriod);
        }
    };
}
