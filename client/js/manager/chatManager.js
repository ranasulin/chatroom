// Service to fetch some data..
app.factory('dataServ', ['$http',($http) => {
    return {
        get : ()=> $http.get('/data')
    }
}]);