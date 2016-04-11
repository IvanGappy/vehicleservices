var app = angular.module('app', ['ngRoute', 'model']);

app.controller('loginCtrl', ['$scope', '$http', '$location', 'model', function ($scope, $http, $location, model) {
    $scope.model = model;
    $scope.customers = [];

    $http({
        cache: false,
        url: "/school/api/customers/all",
        method: 'GET'
    }).success(function (result) {
        model.setCustomers(result);
        $scope.customers = result;
    });

    //bound to input for login
    $scope.user;
    $scope.$watch('user', function (newValue, oldValue) {
        model.setCurrentUser(newValue);
    });

    $scope.password;
    $scope.loggedIn = false;

    $scope.loginFailed = false;

    $scope.registerNewAccountClicked = function () {
        $location.path('/register');
    };

    $scope.loginClicked = function () {
        for (var i = 0; i < $scope.customers.length; i++) {
            if ($scope.customers[i].userName === $scope.user && $scope.customers[i].password === $scope.password) {
                $scope.loggedIn = true;
                $scope.loginFailed = false;
                model.setLoggedIn(true);
                $location.path('/home');
                return;
            }
        }
        $scope.loginFailed = true;
        $scope.password = "";
        $scope.user = "";
    };
}]);

app.controller('homeCtrl', ['$scope', '$http', '$location', 'model', function ($scope, $http, $location, model) {
    $scope.model = model;
    $scope.vehicleHeaders = ['Make', 'Model', 'Year', 'Mileage', 'Condition'];
    $scope.serviceHeaders = ['Service', 'Time', 'Vehicle', 'Technician'];
    $scope.hours = ['10:00 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm'];
    $scope.customerVehicles = [];

    $scope.home = true;
    $scope.addingVehicle = false;
    $scope.registeringService = false;

    $scope.customers = model.getCustomers();
    $scope.customerInfo;
    $scope.technicians = [];
    $scope.services = [];
    $scope.make = "";
    $scope.model = "";
    $scope.mileage = "";
    $scope.year = "";
    $scope.condition = "";

    $scope.day = "";
    $scope.time = "";
    $scope.service = "";
    $scope.tech = "";
    $scope.vehicle = "";
    $scope.addServiceFailed = false;
    $scope.addServiceFailedTime = false;
    $scope.addServiceSuccess = false;
    $scope.customerServicesById = [];
    $scope.week = [];
    $scope.allScheduledServices = [];

    $http({
        cache: false,
        url: "/school/api/services/all",
        method: 'GET'
    }).success(function (result) {
        console.log("services", result);
        $scope.services = result;
    });


    $http({
        cache: false,
        url: "/school/api/technicians/all",
        method: 'GET'
    }).success(function (result) {
        $scope.technicians = result;
        model.setTechnicians(result);
    });

    if (model.getLoggedIn() == false) {
        $location.path('/login');
    }
    for (var i = 0; i < $scope.customers.length; i++) {
        if ($scope.customers[i].userName == model.getCurrentUser()) {
            $scope.customerInfo = $scope.customers[i];
        }
    }

    $scope.logout = function () {
        model.setLoggedIn(false);

        $location.path('/login');
    };

    $scope.showAddVehicle = function () {
        $scope.addingVehicle = true;
        $scope.registeringService = false;
    };

    $scope.showRegisterService = function () {
        $scope.registeringService = true;
        $scope.addingVehicle = false;
    };

    $scope.getCustomerVehicles = function () {
        $http({
            cache: false,
            url: "/school/api/vehicles/all",
            method: 'GET',
            params: {
                id: $scope.customerInfo.customerId
            }
        }).success(function (result) {
            $scope.customerVehicles = result;
            model.setVehicles(result);
        });
    };


    $scope.addVehicle = function () {
        $http({
            cache: false,
            url: "/school/api/vehicle/add",
            method: 'POST',
            data: {
                make: $scope.make,
                model: $scope.model,
                mileage: $scope.mileage,
                year: $scope.year,
                condition: $scope.condition,
                customerId: $scope.customerInfo.customerId
            },
            transformResponse: function (data, headersGetter, status) {
                //This was implemented since the REST service is returning a plain/text response
                //and angularJS $http module can't parse the response like that.
                return {data: data};
            }
        }).success(function (result) {
            $scope.getCustomerVehicles();
            $scope.make = "";
            $scope.model = "";
            $scope.mileage = "";
            $scope.year = "";
            $scope.condition = "";
        });
    };


    $scope.$watch('day', function (newValue, oldValue) {
        console.log(newValue);
    });
    $scope.$watch('time', function (newValue, oldValue) {
        console.log(newValue);
    });
    $scope.$watch('service', function (newValue, oldValue) {
        console.log(newValue);
    });
    $scope.$watch('tech', function (newValue, oldValue) {
        console.log(newValue);
    });
    $scope.$watch('vehicle', function (newValue, oldValue) {
        console.log(newValue);
    });

    $scope.addService = function (day, time, techId, vehicleId, serviceId) {
        $http({
            cache: false,
            url: "/school/api/service/add",
            method: 'POST',
            data: {
                day: day,
                time: time,
                techId: techId,
                vehicleId: vehicleId,
                service: serviceId,
                customerId: $scope.customerInfo.customerId
            },
            transformResponse: function (data, headersGetter, status) {
                //This was implemented since the REST service is returning a plain/text response
                //and angularJS $http module can't parse the response like that.
                return {data: data};
            }
        }).success(function (result) {
            $scope.addServiceSuccess = true;
            $scope.addServiceFailed = false;
            $scope.addServiceFailedTime = false;
            $scope.getCustomerServices();

        });
    };


    //make sure form did not fail then call add service function
    $scope.getInfoForAddService = function () {
        if ($scope.day == "" || $scope.time == "" || $scope.service == "" || $scope.tech == "" || $scope.vehicle == "") {
            $scope.addServiceFailed = true;
            return;
        }
        if($scope.checkIfTimeTaken()){
            $scope.addServiceFailedTime = true;
            return;
        }



    };

    //give technician id and time and see if already in db
    $scope.checkIfTimeTaken = function () {
        $http({
            cache: false,
            url: "/school/api/scheduled/all",
            method: 'GET'
        }).success(function (result) {
            $scope.allScheduledServices = result;
            console.log("all scheduled", result);
            var matches = $scope.tech.match(/\((.*?)\)/);
            console.log("matches", matches);
            var techId = matches[1];
            var date = new Date($scope.day + $scope.time);
            console.log("day + time",date);
            for (var i = 0; i < $scope.allScheduledServices.length; i++) {
                if ($scope.allScheduledServices[i].technician == techId || $scope.allScheduledServices[i].serviceTime == date) {
                    console.log("taken");
                    return true;
                }
            }
            return false;
        });
    };

    //take customer id and return services scheduled {service,time,vehicle, tech}
    $scope.getCustomerServices = function () {
        $http({
            cache: false,
            url: "/school/api/services/id",
            method: 'GET',
            params: {
                id: $scope.customerInfo.customerId
            }
        }).success(function (result) {
            console.log("customer services", result);
            $scope.customerServicesById = result;
        });
    };


    var date = new Date();
    for (var i = 1; i < 8; i++) {
        $scope.week.push((1 + date.getMonth()).toString() + "/" + (i + date.getDate()).toString() + "/" + date.getFullYear());
    }

    $scope.getCustomerVehicles();
    $scope.getCustomerServices();
}]);

app.controller('registerCtrl', ['$scope', '$http', '$location', 'model', function ($scope, $http, $location, model) {
    $scope.model = model;
    $scope.registerFailed = false;
    $scope.user = "";
    $scope.password = "";
    $scope.fName = "";
    $scope.lName = "";
    $scope.email = "";
    $scope.phone = "";

    //go back to login page
    $scope.loginClicked = function () {
        $location.path('/login');
    };

    //put username info in database
    $scope.registerClicked = function () {
        if ($scope.user.length == 0 || $scope.password.length == 0 || $scope.fName.length == 0 || $scope.lName.length == 0 || $scope.email.length == 0 || $scope.phone.length == 0) {
            $scope.registerFailed = true;
            return;
        }
        $scope.registerFailed = false;
        model.setCurrentUser($scope.user);
        model.setLoggedIn(true);
        $http({
            cache: false,
            url: "/school/api/customers/add",
            method: 'POST',
            data: {
                userName: $scope.user,
                password: $scope.password,
                firstName: $scope.fName,
                lastName: $scope.lName,
                email: $scope.email,
                phone: $scope.phone
            },
            transformResponse: function (data, headersGetter, status) {
                //This was implemented since the REST service is returning a plain/text response
                //and angularJS $http module can't parse the response like that.
                return {data: data};
            }
        }).success(function (result) {
            $http({
                cache: false,
                url: "/school/api/customers/all",
                method: 'GET'
            }).success(function (result) {
                model.setCustomers(result);
                $scope.customers = result;
                $location.path('/home');
            }).error(function () {
                $scope.registerFailed = true;
            });
        });
    };

}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/login", {
        templateUrl: '/angular/login',
        controller: 'loginCtrl',
        reloadOnSearch: true
    }).when("/register", {
        templateUrl: '/angular/register',
        controller: 'registerCtrl',
        reloadOnSearch: true
    }).when("/home", {
        templateUrl: '/angular/home',
        controller: 'homeCtrl',
        reloadOnSearch: true
    }).otherwise({
        redirectTo: "/login"
    });
}]);