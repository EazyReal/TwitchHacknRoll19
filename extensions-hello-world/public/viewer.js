var token = "";
var tuid = "";
var ebs = "";

// because who wants to type this every time?
var twitch = window.Twitch.ext;

// create the request options for our Twitch API calls
var requests = {
    //vote: createVoteRequest('POST', 'vote'),
    vote1: createVoteRequest('POST', 'vote', 1),
    vote2: createVoteRequest('POST', 'vote', 2),
    vote3: createVoteRequest('POST', 'vote', 3),
    get: createRequest('GET', 'query')
};

function createVoteRequest(type, method, teami) {
    return {
        type: type,
        url: location.protocol + '//localhost:8081/' + method + '?team_id=' + teami,
        //url: location.protocol + '//localhost:8081/' + method,
        //team_id : teami,
        success: updateBlock,
        error: logError
    }
}

function createRequest(type, method) {

    return {
        type: type,
        url: location.protocol + '//localhost:8081/color/' + method,
        success: updateBlock,
        error: logError
    }
}

function setAuth(token) {
    Object.keys(requests).forEach((req) => {
        twitch.rig.log('Setting auth headers');
        requests[req].headers = { 'Authorization': 'Bearer ' + token }
    });
}

twitch.onContext(function(context) {
    twitch.rig.log(context);
});

twitch.onAuthorized(function(auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;

    // enable the button
    $('#cycle').removeAttr('disabled');
    $('#vote1').removeAttr('disabled');
    $('#vote2').removeAttr('disabled');
    $('#vote3').removeAttr('disabled');

    setAuth(token);
    $.ajax(requests.get);
});

function updateBlock(hex) {
    twitch.rig.log('Updating block color');
    $('#color').css('background-color', hex);
}

function logError(_, error, status) {
  twitch.rig.log('EBS request returned '+status+' ('+error+')');
}

function logSuccess(hex, status) {
  // we could also use the output to update the block synchronously here,
  // but we want all views to get the same broadcast response at the same time.
  twitch.rig.log('EBS request returned '+hex+' ('+status+')');
}

$(function() {
    // when we click the cycle button
    $('#vote1').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        twitch.rig.log('Voted 1');
        $.ajax(requests.vote1);
    });
    $('#vote2').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        twitch.rig.log('Voted 2');
        $.ajax(requests.vote2);
    });
    $('#vote3').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        twitch.rig.log('Voted 3');
        $.ajax(requests.vote3);
    });

    //todo, broadcast listener
    // listen for incoming broadcast message from our EBS
    twitch.listen('broadcast', function (target, contentType, color) { //status, time
        twitch.rig.log('Received broadcast color');
        updateBlock(color);
        //todo
        //Renderer(status, time); //0:No gmae, N: N iteration, -1:End, time = remaining time for this stage
    });
});
