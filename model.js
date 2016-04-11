var model = angular.module('model', []);

model.factory("model", [function () {
    var currentUser;
    var loggedIn = false;
    var customers;
    var vehicles;
    var services;
    var technicians;

    return {
        'getCurrentUser':function(){
            return currentUser;
        },
        'setCurrentUser':function(value){
            currentUser = value;
        },
        'getLoggedIn':function(){
            return loggedIn;
        },
        'setLoggedIn':function(value){
            loggedIn = value;
        },
        'getCustomers':function(){
            return customers;
        },
        'setCustomers':function(value){
            customers = value;
        },
        'getVehicles':function(){
            return vehicles;
        },
        'setVehicles':function(value){
            vehicles = value;
        },
        'getServices':function(){
            return services;
        },
        'setServices':function(value){
            services = value;
        },
        'setTechnicians':function(value){
            technicians = value;
        },
        'getTechnicians':function(){
            return technicians;
        }
    };
}]);