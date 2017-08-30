var player = false;
var videoFile = "";//"https://player.vimeo.com/external/226277097.sd.mp4?s=0e46a8f280e7555aad4a106bb175510bd16229be&profile_id=165&oauth2_token_id=931588340";
var streamChannel = "";
var lesson_start_time = "";
var videoDuration = -1;
var campaignData = {};
var clockInterval = null;

var preRecordedPlayer = function(){
    preRecPlayer = jwplayer("jwplayer-container");

    preRecPlayer.setup({
        'skin': {
               name: "shaw",
            },
        'file' : 'https://vimeo.com/231557692',
        'width': '100%',
        'height': '100%',
        'primary': 'flash',
        'controls': false
    });

    preRecPlayer.on('setupError', function (error) {
        preRecPlayer.remove();
        //$scope.jwplayerSetupError = true;
        //$scope.userHasNoFlash = !require('app/js/js_utils/hasFlash')();
        console.error(error);
    });

}

var initializePlayer = function () {
    self.player = jwplayer("jwplayer-container");
    var streamChannel = '';//$state.params.stream_channel || lesson.stream_channel || campaign.product.slug;

    //$mixpanel.track('live-webinar-page',{'course':streamChannel});

    var playerSetting = {
        skin: {
            name: 'shaw'
        },
        'width': '100%',
        'height': '100%',
        'autostart': true,
        'repeat' : false,
        'controls' : false,
        'rtmp'     : {
                       'bufferlength': 0.1
                    },

        'playlist': [{
            sources :[{

                file: 'rtmp://cdn.influxis.net:1935/shawacademy/' + streamChannel,
                title: '',
                mediaid: 'oNE9GeKV'
            },
            {
                file: 'https://lowlateu1-live-hls.secure.footprint.net/shawacademy/' + streamChannel + '/playlist.m3u8',
                title: '',
                mediaid: 'lOGSQMtP'
            }]
        }]
    }

    if(isLessonRecorded()){
        playerSetting['playlist'][0]['sources'][0]['file'] = videoFile;
        playerSetting['playlist'][0]['sources'][1]['file'] = videoFile;
    }

    // if ($scope.breakpointXS || $scope.breakpointSM) {
    //     playerSetting['autostart'] = false;
    // }

    self.player.setup(playerSetting);

    //self.player.setMute($scope.volumeMute);

    //$scope.jwplayerState = self.player.getState();

    self.player.on('firstFrame', function(){
        // if($state.params.mute != 'true')
        //     self.player.setMute(false);
    })

    self.player.on('pause idle buffer play error setupError firstFrame beforeComplete', function(event) {
        //$mixpanel.track('live-webinar-page',{"jwplayer-event":event.type});
        console.log("Jwplayer event caught " + event.type);

        if(event.type == "firstFrame" && isLessonRecorded()){
            videoDuration = self.player.getDuration();
            seekRecordedLesson();
        }

        if(event.type == "beforeComplete" && isLessonRecorded()){
            self.player.remove();
        }

        if (event.type == 'setupError' || event.type == 'error') {
            self.player.remove();
            console.log(event.message);
            initializePlayerWithHls();
        }
        else {
                if (event.type == 'pause') {
                    playJWPlayer();
                }
                // $scope.$apply(function(){
                //     $scope.jwplayerState = event.type;
                // });
        }
    })

    // self.player.on('error', function() {
    //     $mixpanel.track('live-webinar-page',{"jwplayer-event":"media-error"});
    // });

};

function isLessonRecorded(){
    if(videoFile && videoFile.trim()){
        return true;
    }else{
        return false;
    }
}

function endWebinar() {
    pauseJWPlayer();
    showBanner(campaignData, "Webinar is finished!!");
}

function seekRecordedLesson(){
    if(isLessonRecorded()){
        //get webinar seek time            
        var startTime = moment(lesson_start_time);
        var currentTime = moment().utc();
        var seekTime = (moment.duration(currentTime.diff(startTime)).asMilliseconds())/1000;
        if(seekTime > 0){
            self.player.seek(seekTime);
        }

        setTimeout(()=>{
            endWebinar();
        }, (videoDuration-seekTime)*1000)
        // console.log("Duration");//3522.346667
        // console.log(videoDuration);
    }
}

var playJWPlayer = function() {
    self.player.play(true);
}

var pauseJWPlayer = function() {
    self.player.play(false);
}

var initializePlayerWithHls = function () {
    self.player = jwplayer("jwplayer-container");
    var streamChannel = '';//$state.params.stream_channel || lesson.stream_channel || campaign.product.slug;

    var playerSetting = {
        skin: {
            name: 'shaw'
        },
        'width': '100%',
        'height': '100%',
        'autostart': true,
        'repeat' : false,
        'controls' : false,
        'hlshtml' : true,
        'playlist': [{
            sources :[{

                file: 'https://lowlateu1-live-hls.secure.footprint.net/shawacademy/' + streamChannel + '/playlist.m3u8',
                title: '',
                mediaid: 'lOGSQMtP'
            }]
        }]
    }

    if(isLessonRecorded()){
        playerSetting['playlist'][0]['sources'][0]['file'] = videoFile;
    }

    // if ($scope.breakpointXS || $scope.breakpointSM) {
    //     playerSetting['autostart'] = false;
    // }

    self.player.setup(playerSetting);

    //self.player.setMute($scope.volumeMute);

    //$scope.jwplayerState = self.player.getState();

    self.player.on('firstFrame', function(){
        // if($state.params.mute != 'true')
        //     self.player.setMute(false);
    })

    self.player.on('pause idle buffer play error setupError firstFrame beforeComplete', function(event) {

        console.log("Jwplayer event caught " + event.type)

        if(event.type == "firstFrame" && isLessonRecorded()){
            videoDuration = self.player.getDuration();
            seekRecordedLesson();
        }

        if(event.type == "beforeComplete" && isLessonRecorded()){
            self.player.remove();
        }

        if (event.type == 'setupError' || event.type == 'error') {
            self.player.remove();
            // $scope.$apply(function(){
            //     $scope.jwplayerState = event.type;
            //     $scope.jwplayerSetupError = true;
            //     $scope.jwplayerErrorMessage = event.message;
            // });
        } else {
            if (event.type == 'pause') {
                playJWPlayer();
            }
            // $scope.$apply(function(){
            //         $scope.jwplayerState = event.type;
            //     });
        }
    })
};

function getData(callback) {
    var selectedUser = gup('user') || "1";
    var selectedUserData = userData[selectedUser];
    var data = {
        user : selectedUserData,
        coursename : "coursename",
        slug: "",
        lesson : {
            name: "lessonname",
            start_time: Date.now(),
        }
    }
    setTimeout(function(){ callback(data) }, 3000);
}

function webinarDataReceived(data) {
    //startWebinar(data);
    campaignData = data;
    lesson_start_time = moment(data.lesson.start_time);
    var webinarDate = moment(data.lesson.start_time);
    var currentDate = moment().utc();


    if (currentDate < webinarDate) {
        showBanner(data, "");
        var diff = moment.duration(webinarDate.diff(currentDate)).asMilliseconds();
        var duration = moment.duration(webinarDate.diff(currentDate)).asMilliseconds();
        clockInterval = setInterval(function(){
          duration = moment.duration(duration - 1000, 'milliseconds');
          $('.lesson-message').html(duration.hours() + ":" + duration.minutes() + ":" + duration.seconds())
        }, 1000);
        setTimeout(()=>{
            window.clearInterval(clockInterval);
            startWebinar(data);
        }, diff);
    } else {
        startWebinar(data);
    }
}

function showBanner(data, msg) {
    $('.lesson-title').html(data.name);
    $('.lesson-name').html(data.lesson.name);

    if (msg) {
        $('.lesson-message').html(msg);
    }

    $('#loading').hide();
    $('#player').hide();
    $('#banner').show();
}

function startWebinar(data) {
    console.log(data);
    $('#loading').hide();
    $('#banner').hide();
    $('#player').show();

    if (data.lesson.video_file) {
        videoFile = data.lesson.video_file;
    } else {
        streamChannel = data.lesson.stream_channel | data.lesson.slug;
    }

    initializePlayer();

    $("#jwplayer-container").on("contextmenu",function(){
       return false;
    });

    $zopim(function() {
        $zopim.livechat.window.show(); 
        // $zopim.livechat.setName(selectedUserData.name);
        // $zopim.livechat.setEmail(selectedUserData.email);
        // $zopim.livechat.setPhone(selectedUserData.phone);
        // $zopim.livechat.prechatForm.setGreetings('Hi '+ selectedUserData.name + ", Welcome to Shawacademy.");   
        $zopim.livechat.departments.setVisitorDepartment(streamChannel);
        // $zopim.livechat.departments.filter(selectedUserData.course);
    });
}

function getCampaignData(campId, callback){
    $.getJSON("./campaigns.json",
         function(data){
             var campData = {};
             $.map(data, 
             function(pcampData, pcampId){
                if (pcampId == campId){
                    callback(pcampData);
                    return;
                }
             });
         });
}


function gup(name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return null;
    else
        return results[1];
}

$( document ).ready(function() {
    
    $zopim(function() {
        $zopim.livechat.hideAll();
    });
    var campId = gup("campId");
    getCampaignData(campId, webinarDataReceived);
})

