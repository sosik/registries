(function(angular) {
	'use strict';

	angular.module('xpsui:services') 
	.factory('xpsui:FileUploadFactory', ['$http', 	
		/**
		 * Factory method
		 */
		function($http) {
		var idCounter = 0;
		/**
		 * FileUploader constructor
		 * @param {$scope} $scope - scope to bind fileuploader to
		 * @param {File} file - file to upload
		 * @constructor file-upload-snippet.psFileUploadFactory~FileUploader
		 */
		var FileUploader = function($scope, data, contentType, url) {
			this.id = ++idCounter;
			this.$scope = $scope;
			this.data = data;
			this.xhr = new XMLHttpRequest();
			this.progress = 0;
			this.contentType = contentType;
			this.url = url;

			/**
			 * ddd
			 * @method
			 */
			this.upload = function(callback) {
				var that = this;
				that.callback = callback;


				this.xhr.upload.addEventListener('progress', function(evt) {
					if (evt.lengthComputable) {
						that.progress = evt.loaded / evt.total;
					}

					that.$scope.$emit('psui:fileupload-progress', {
						uploader: that,
					});
				});

				this.xhr.onreadystatechange = function() {
					if (that.xhr.readyState === 1) {
						that.$scope.$emit('psui:fileupload-start', {
							uploader: that,
						});
						that.xhr.setRequestHeader('content-type', that.contentType || 'application/octet-stream');
						that.xhr.send(that.data);
					} else if (that.xhr.readyState === 4) {
							that.progress = 1;
						if (that.xhr.status === 200) {
							that.$scope.$emit('psui:fileupload-success', {
								uploader: that,
							});
							that.callback(null, that.xhr.responseText);
						} else {
							that.$scope.$emit('psui-fileupload-fail', {
								uploader: that,
							});
							that.callback(that.xhr.status);
						}
					}
				};
				this.xhr.open('PUT', this.url);
			};
		};

		var exports = {
			/**
			 * xxx
			 * @property {FileUploader}
			 */
			FileUploader: FileUploader
		};

		return exports;
	}]);

}(window.angular));