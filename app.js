'use strict';

angular.module('tsa', [
    'ngMaterial',
    'chart.js'
])

.controller('AppController', ['$scope', '$http', function($scope, $http) {

    $scope.dataUrl = 'data/testdata.json';
    $scope.urls = [
        'data/testdata.json',
        'https://rawgit.com/semljola/973cae0b02cf3b35df3b654c9653c2ce/raw/f29d08826179dd150611266725170f82b10071e5/ten_timeseries.json'
    ];

    $scope.models = [
        'zero',
        'range',
        'avgDev',
        'mAvgDev'
    ]

    $scope.datasetOverride = [
      {},
      {
        showLine: false,
        pointBorderWidth: 3,
        pointBorderColor: "rgba(255,0,0,1)",
      }
    ];

    $scope.load = function() {
        $http.get($scope.dataUrl).then(
            function(result) {
                $scope.data = result.data;
                $scope.data.analysis = [];
                $scope.data.series = [];
                var emptySerie = [];
                for(var i=0;i<$scope.data.dates.length;i++) {
                    emptySerie.push(null);
                }
                for(var i=0;i<$scope.data.values.length;i++) {
                    $scope.data.series.push(String.fromCharCode(65 + i));
                    $scope.data.analysis[i] = emptySerie;
                }
            }, function(error) {
                console.log(error);
            }
        );
    };

    $scope.setModel = function(index, model, parameters) {
        switch(model) {
            case 'zero':
                useZero(index, parameters);
                break;
            case 'range':
                useRange(index, parameters);
                break;
            case 'avgDev':
                useAvgDev(index, parameters);
                break;
            case 'mAvgDev':
                useMAvgDev(index, parameters);
                break;
        }
    };

    // Models
    function useZero(index, parameters) {
        var serie = $scope.data.values[index];
        var asisSerie = [];
        angular.forEach(serie, function(value) {
            if(value == 0) {
                asisSerie.push(value);
            } else {
                asisSerie.push(null);
            }
        });
        $scope.data.analysis[index] = asisSerie;
    };

    function useRange(index, parameters) {
        var serie = $scope.data.values[index];
        var asisSerie = [];
        angular.forEach(serie, function(value) {
            if(value < parameters.min || value > parameters.max) {
                asisSerie.push(value);
            } else {
                asisSerie.push(null);
            }
        });
        $scope.data.analysis[index] = asisSerie;
    };

    function useAvgDev(index, parameters) {
        var serie = $scope.data.values[index];
        var asisSerie = [];
        var sum = 0;

        angular.forEach(serie, function(value) {
            sum=sum+value;
        });
        var mean = sum/serie.length;

        angular.forEach(serie, function(value) {
            var pcDiff = (Math.abs((Math.abs(mean) - Math.abs(value))) / ((Math.abs(mean) + Math.abs(value))/2))*100;
            if(pcDiff > parameters.threshold) {
                asisSerie.push(value);
            } else {
                asisSerie.push(null);
            }
        });
        $scope.data.analysis[index] = asisSerie;
    };

    function useMAvgDev(index, parameters) {
        var serie = $scope.data.values[index];
        var asisSerie = [];
        asisSerie.push(null);
        for (var i = 1; i < serie.length-1; i++)
        {
            var mean = (serie[i] + serie[i-1] + serie[i+1])/3.0;
            var pcDiff = (Math.abs((Math.abs(mean) - Math.abs(serie[i]))) / ((Math.abs(mean) + Math.abs(serie[i]))/2))*100;
            if(pcDiff > parameters.threshold) {
                asisSerie.push(serie[i]);
            } else {
                asisSerie.push(null);
            }
        }
        asisSerie.push(null);
        $scope.data.analysis[index] = asisSerie;
    };
}]);
