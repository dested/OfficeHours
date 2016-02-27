angular.module('OfficeHours.client').service('spinnerService',
  function ($modal) {
  this.numInProgress = 0;
  this.currentMessage = 'main';
  this.defaultMessage = "Please Wait";

  this.monitorPromise = function (message, promise) {

    this.numInProgress++;

    //If the spinner is currently not on, turn it on
    if (this.numInProgress === 1) {
      this.currentMessage = message || this.defaultMessage;
      this.start();
    }

    promise['finally']((function () {
      //Decrement number of requests in progress when promise resolves/rejects
      if(this.numInProgress > 0) {
        this.numInProgress--;
      }

      //If this was the last item in progress, turn the spinner off
      if (this.numInProgress === 0) {
        this.currentMessage = null;
        this.stop();
      }
    }).bind(this));

    return promise;

  };
  this.startSpinner = function (message) {
    this.numInProgress++;

    //If the spinner is currently not on, turn it on
    if (this.numInProgress === 1 && !this.currentModal) {
      this.currentMessage = message || this.defaultMessage;
      this.start();
    }
  };

  this.stopSpinner = function () {
    //Decrement number of requests in progress when promise resolves/rejects
    if (this.numInProgress > 0) {
      this.numInProgress--;
    }

    //If this was the last item in progress, turn the spinner off
    if (this.numInProgress === 0) {
      this.currentMessage = null;
      this.stop();
    }
  };


  this.start = function () {
    this.currentModal = $modal.open({
      size: 'spinner',
      templateUrl: 'components/modals/spinnerModal.html',
      windowTemplateUrl: 'components/modals/spinnerModalWindow.html',
      controller: function ($scope, currentMessage) {
        $scope.model = {};
        $scope.callback = {};
        $scope.model.currentMessage = currentMessage;
      },
      resolve: {
        currentMessage: (function () {
          return this.currentMessage;
        }).bind(this)
      }
    });
  };

  this.stop = function () {
    var that = this;

    var closeModal = function () {
      if (that.currentModal && that.currentModal.dismiss) {
        that.currentModal.dismiss();
      }
    };

    if (that.currentModal && that.currentModal.result) {
      that.currentModal.result.finally(function () {
        that.currentModal = null;
        that.numInProgress = 0;
      });
    }

    closeModal();
    setTimeout(closeModal, 300); // retry because at times modal doesn't actually close
    setTimeout(closeModal, 1000); // retry because at times modal doesn't actually close
  };
});
