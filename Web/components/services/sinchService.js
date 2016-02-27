angular.module('OfficeHours.client')
  .service('sinchService',
  function ($rootScope, $http, serviceUrl, $q) {
    var sinchClient = new SinchClient({
      applicationKey: '1321b3c3-f27b-4a5f-a3a0-d117aab8894f',
      capabilities: {calling: true, video: true},
      supportActiveConnection: true,
      onLogMessage: function (message) {
        console.log(message);
      }
    });

    var callListeners = {
      onCallProgressing: function(call) {
      },
      onCallEstablished: function(call) {
        $('video#outgoing').attr('src', call.outgoingStreamURL);
        $('video#incoming').attr('src', call.incomingStreamURL);
        $('audio#ringback').trigger("pause");
        $('audio#ringtone').trigger("pause");

        //Report call stats
        var callDetails = call.getDetails();
        $('div#callLog').append('<div id="stats">Answered at: '+(callDetails.establishedTime && new Date(callDetails.establishedTime))+'</div>');
      },
      onCallEnded: function(call) {
        $('video#outgoing').attr('src', '');
        $('video#incoming').attr('src', '');
        this.sinchClient.terminate();
      }
    };



    function handleError(error){
      console.log(error);
    }
    sinchClient.startActiveConnection();

    this.checkAccount = function (user) {
      var deferred = $q.defer();

      var signInObj = {};
      signInObj.username = user.sinch.username;
      signInObj.password = user.sinch.password;

      sinchClient.start(signInObj, function() {
        deferred.resolve();
      }).fail(function(){
        sinchClient.newUser(signInObj, function(ticket) {
          //On success, start the client
          sinchClient.start(ticket, function() {
            deferred.resolve();
          }).fail(handleError);
        }).fail(handleError);
      });
      return deferred.promise;
    };

    this.startCallMember = function (user) {
      this.callClient = sinchClient.getCallClient();
      this.callClient.initStream();
      this.callClient.addEventListener({
        onIncomingCall: function(incomingCall) {
          //Manage the call object
          this.call = incomingCall;
          this.call.addEventListener(callListeners);
          this.call.answer(); //Use to test auto answer
        }
      });


    };

    this.startCallVendor= function (user,appointment) {
      this.callClient = sinchClient.getCallClient();
      this.callClient.initStream();
      this.call = this.callClient.callUser(appointment.memberSinchUsername);
      this.call.addEventListener(callListeners);
    };

    this.hangup= function () {
      this.call&& this.call.hangup();
    };
  }
);
