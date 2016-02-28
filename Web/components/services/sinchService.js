angular.module('OfficeHours.client')
  .service('sinchService',
  function ($rootScope, $http, serviceUrl, $q) {
    var self = this;
    this.sinchClient = new SinchClient({
      applicationKey: '1321b3c3-f27b-4a5f-a3a0-d117aab8894f',
      capabilities: {calling: true, video: true},
      supportActiveConnection: true/*,
       onLogMessage: function (message) {
       console.log(message);
       }*/
    });


    var memberConnected = false;

    var callListeners = {
      onCallProgressing: function (call) {
      },
      onCallEstablished: function (call) {
        memberConnected = true;
        $('video#outgoing').attr('src', call.outgoingStreamURL);
        $('video#incoming').attr('src', call.incomingStreamURL);
        //$('audio#ringback').trigger("pause");
        //$('audio#ringtone').trigger("pause");

        //Report call stats
        var callDetails = call.getDetails();
        //$('div#callLog').append('<div id="stats">Answered at: '+(callDetails.establishedTime && new Date(callDetails.establishedTime))+'</div>');
      },
      onCallEnded: function (call) {
        memberConnected = false;
        $('video#outgoing').attr('src', '');
        $('video#incoming').attr('src', '');
        self.sinchClient.terminate();
      }
    };


    function handleError(error) {
      console.log(error);
    }

    self.sinchClient.startActiveConnection();

    this.checkAccount = function (user) {
      var deferred = $q.defer();

      var signInObj = {};
      signInObj.username = user.sinch.username;
      signInObj.password = user.sinch.password;

      self.sinchClient.start(signInObj, function () {
        deferred.resolve();
      }).fail(function () {
        self.sinchClient.newUser(signInObj, function (ticket) {
          //On success, start the client
          self.sinchClient.start(ticket, function () {
            deferred.resolve();
          }).fail(function (d) {
            deferred.reject();
            handleError(d);
          });
        }).fail(function (d) {
          deferred.reject();
          handleError(d);
        });
      });
      return deferred.promise;
    };

    this.startCallMember = function (user) {
      this.callClient = self.sinchClient.getCallClient();
      this.callClient.initStream();
      this.callClient.addEventListener({
        onIncomingCall: function (incomingCall) {
          debugger;
          //Manage the call object
          this.call = incomingCall;
          this.call.addEventListener(callListeners);
          this.call.answer(); //Use to test auto answer
        }
      });
    };

    this.startCallVendor = function (user, appointment) {
      debugger;
      this.callClient = self.sinchClient.getCallClient();
      this.callClient.initStream();

      var int;
      int = setInterval(function () {
        if (memberConnected) {
          clearInterval(int);
          return;
        }
        self.call = self.callClient.callUser(appointment.memberSinchUsername);

      }, 1000);
      this.call = this.callClient.callUser(appointment.memberSinchUsername);
      this.call.addEventListener(callListeners);


    };

    this.hangup = function () {
      this.call && this.call.hangup();
    };
  }
);
