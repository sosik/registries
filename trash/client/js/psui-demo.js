angular.module('psui-demo',['psui-autocomplete', 'psui-contenteditable', 'psui-selectbox','ui.ace', 'psui-uploadable-image', 'psui-datepicker', 'psui-imageresizor','psui-notification'])
.controller('psui-autocomplete-demo-simple', ['$scope', function($scope) {
	$scope.autocompleteOptions1 = {
		data: ['Fero', 'Jozo', 'Peter', 'Palo', 'Frantisek', 'Ernest', 'Gregor', 'Marek', 'Milan', 'Albert', 'Tamara', 'Urban', 'Stanislav', 'Hurban', 'Eva'],
		onChange: function(text, data) {
			var result = [];
			var re = new RegExp(text, 'i');
			for (var i = 0; i < data.length; i++) {
				if (re.test(data[i])) {
					result.push(data[i]);
				}
			}

			return result;
		},
		render: function(text, data) {
			var re = new RegExp(text, 'i');
			var pos = data.search(re);
			if (pos > -1) {
				return '<div>'+data.substr(0,pos) + '<B>' + data.substr(pos, text.length) + '</b>' + data.substr(pos+text.length)+'</div>';
			}
			return '<div>'+data+'</div>';
		}
	};

	var counter = 0;
	$scope.addDataToAutocomplete1 = function() {
		$scope.autocompleteOptions1.data.push('D' + counter++);
	}

	$scope.autocomplete1val = 10;
}])
.controller('psui-contenteditable-demo-simple', ['$scope', function($scope) {
	$scope.data = 'fgdfgdfgdfg';
}])
.controller('psui-selectbox-demo-simple', ['$scope', function($scope) {
	$scope.selectBoxOpts = {
		data: ['Ano', 'Nie']
	}

	$scope.model = {
		selected: 'xxx'
	}
}])
.controller('psui-uploadable-image-demo', ['$scope', function($scope) {

}])
.controller('psui-datepicker-demo-simple', ['$scope', function($scope) {
	$scope.date = {
		selected: 'xxx'
	}
}])
.controller('psui-datepicker-demo-simple', ['$scope', function($scope) {
	$scope.date = {
		selected: 'xxx'
	}
}])
.controller('psui-notification-demo-simple',['$scope','psui.notificationFactory',function($scope, notificationFactory) {
	
	var tmp = {};
	$scope.putInfo = function (){
		tmp = {text2:'info'};
		notificationFactory.info(tmp);
	}
	
	$scope.putError = function (){
		tmp = {translationCode:'schema.editor.list.of.schemas.for.editation'};
		notificationFactory.error(tmp);
	}
	
	$scope.putInfoDel = function (){
		tmp = {text:'info',deletable :true};
		notificationFactory.info(tmp);
	}
	
	$scope.putErrorDel = function (){
		tmp = {text:'error',deletable: true};
		notificationFactory.error(tmp);
	}
	
	$scope.putWarnDel = function (){
		tmp = {text:'warning',deletable: true};
		notificationFactory.warn(tmp);
	}
	
	$scope.putInfoTime = function (){
		tmp = {text:'info',time :2000};
		notificationFactory.info(tmp);
	}
	
	$scope.putErrorTime = function (){
		tmp = {text:'error',time: 2000};
		notificationFactory.error(tmp);
	}
	
	$scope.putInfoTimeDel = function (){
		tmp = {text:'info',time :2000, deletable: true};
		notificationFactory.info(tmp);
	}
	
	$scope.putErrorTimeDel = function (){
		tmp = {text:'error',time: 2000, deletable: true};
		notificationFactory.error(tmp);
	}
	
	$scope.clearNotif = function(){
		notificationFactory.clear();
	}
}])
