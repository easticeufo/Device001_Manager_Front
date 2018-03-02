/**
 * Created by madongfang on 2016/9/1.
 */

//testServerAddr = "http://localhost:8082/"; // 开发测试时使用
//testServerAddr = "http://www.yjm2m.com:8080/Device001_Manager/"; // 开发测试时使用
testServerAddr = ""; // 发布时使用

var eastApp = angular.module("eastApp", ["ui.router", "restfulApiService", "appControllers", "appFilters", "toolService",
    "userLogin", "ui.bootstrap", "angular-md5", "ui.select"]);

eastApp.config(["$stateProvider", "$urlRouterProvider", "$locationProvider",
    function ($stateProvider, $urlRouterProvider, $locationProvider)
    {
        $locationProvider.hashPrefix("?"); // 路由路径中增加?,解决微信支付在IOS手机端页面跳转后导致支付url错误无法支付的问题
        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state("login", {
                url: "/login",
                template: "<user-login do-login='doLogin(username, password)'></user-login>",
                controller: "LoginController"
            })
            .state("managerRegister", {
                url: "/managerRegister",
                templateUrl: "templates/managerRegister.html",
                controller: "ManagerRegisterController"
            })
            .state("main", {
                url: "/main",
                templateUrl: "templates/main.html",
                controller: "MainController"
            })
            .state("main.device", {
                url: "/devices",
                templateUrl: "templates/devices.html",
                controller: "DevicesController"
            })
            .state("main.devicePlugs", {
                url: "/devices/{deviceCode}/plugs",
                templateUrl: "templates/devicePlugs.html",
                controller: "DevicePlugsController"
            })
            .state("main.deviceConfig", {
                url: "/devices/{deviceCode}",
                templateUrl: "templates/deviceConfig.html",
                controller: "DeviceConfigController"
            })
            .state("main.report", {
                url: "/report",
                templateUrl: "templates/report.html",
                controller: "ReportController"
            })
            .state("main.manager", {
                url: "/managers",
                templateUrl: "templates/managers.html",
                controller: "ManagersController"
            })
            .state("main.managerConfig", {
                url: "/managers/{managerId}",
                templateUrl: "templates/managerConfig.html",
                controller: "ManagerConfigController"
            })
            .state("main.chargeRecord", {
                url: "/chargeRecords",
                templateUrl: "templates/chargeRecords.html",
                controller: "ChargeRecordsController"
            })
            .state("main.area", {
                url: "/areas",
                templateUrl: "templates/areas.html",
                controller: "AreasController"
            })
            .state("main.areaConfig", {
                url: "/areas/{areaId}",
                templateUrl: "templates/areaConfig.html",
                controller: "AreaConfigController"
            })
            .state("main.custom", {
                url: "/customs",
                templateUrl: "templates/customs.html",
                controller: "CustomsController"
            })
            .state("main.customDetail", {
                url: "/customs/{customId}",
                templateUrl: "templates/customDetail.html",
                controller: "CustomDetailController"
            })
            .state("main.finance", {
                url: "/finance",
                templateUrl: "templates/finance.html",
                controller: "FinanceController"
            })
            .state("main.cardInfo", {
                url: "/cards/{cardId}",
                templateUrl: "templates/cardInfo.html",
                controller: "CardInfoController"
            });
    }
]);
