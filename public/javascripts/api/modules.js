/*global angular, _*/
(function(window, angular) {
	'use strict';
	angular.module('indexApp', [])
	.config(['$interpolateProvider', function($interpolateProvider) {
	  $interpolateProvider.startSymbol('//');
	  $interpolateProvider.endSymbol('//');
	}])
	.controller('mainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
		var pid = location.hash.replace('#', '');
		$http.get('/api/modules.json/'+pid).success(function(resp){
			$scope.modules = resp;
		});
		$scope.$watch('api.inObject', function(nVal){
			try{
				$scope.inObject = JSON.stringify(Mock.mock(JSON.parse(nVal)), null, '  ');
			} catch(e){
				$scope.inObject = nVal;
			}
		});
		$scope.$watch('api.outObject', function(nVal){
			try{
				$scope.outObject = JSON.stringify(Mock.mock(JSON.parse(nVal)), null, '  ');
			} catch(e){}
		});
		$scope.sendRequest = function(){
			$http.post('/api/request.json', {method: $scope.api.method, url:$scope.api.url, param:$scope.inObject}).success(function(resp){
				$scope.result = JSON.stringify(resp, null, '  ');
			}).error(function(resp){
				$scope.result = JSON.stringify(resp, null, '  ');
			});
		};
		$scope.keydown = function($event, module){
			if(13===$event.keyCode) $scope.save(module);
		};
		$scope.save = function(module){
			if(module){
				$http.put('/api/module.json/'+module._id, {pid: module.pid, interfaces: module.interfaces, name: module.text}).success(function(resp){
					if(resp){
						module.name = module.text;
						module.text = null;
					} else {
						$scope.hint('保存模块失败!\n'+resp);
					}
				});
			} else {
				$http.post('/api/module.json', {name: $scope.mod.name, pid: pid}).success(function(resp){
					if(resp){
						$scope.modules = $scope.modules||[];
						$scope.modules.push(resp);
						$scope.mod = null;
					} else {
						$scope.hint('保存模块失败!\n'+resp);
					}
				});
			}
		};
		$scope.remove = function(_id){
			$http.delete('/api/module.json/'+_id).success(function(resp){
				if(resp){
					for(var i=$scope.modules.length-1;i>=0;i--){
						if($scope.modules[i]._id===_id){
							$scope.modules.splice(i, 1);
							break;
						}
					}
				} else {
					$scope.hint('删除模块失败!');
				}
			});
		};
		$scope.cancel = function(module){
			if(module) module.text = null;
			else $scope.mod = null;
		};
		$scope.showInterfaceDetail = function(_id){
			$http.get('/api/interface.json/'+_id).success(function(resp){
				$scope.api = resp;
			});
		};
		$scope.edit = function(module){
			if(module){
				module.text = module.name;
				$timeout(function(){
					document.getElementById('_moduleName').focus();
				},0);
			} else {
				$scope.mod = $scope.mod||{};
				$timeout(function(){
					document.getElementById('moduleName').focus();
				},0);
			}
		};
		$scope.deleteInterface = function(_id, list){
			$http.delete('/api/interface.json/'+_id).success(function(resp){
				if(resp){
					for(var i=list.length-1;i>=0;i--){
						if(list[i]._id===_id){
							list.splice(i,1);
							break;
						}
					}
				} else {
					$scope.hint('删除接口失败');
				}
			});
		};
		$scope.hint = function(text){
			$scope.message = text;
			$timeout(function(){
				$scope.message = '';
			}, 5000);
		};
	}])
	;
	angular.bootstrap(document, ['indexApp']);
})(window, angular);