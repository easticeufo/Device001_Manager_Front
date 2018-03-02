/**
 * Created by madongfang on 2016/9/1.
 */

var restfulApiService = angular.module("restfulApiService", ["ngResource"]);

restfulApiService.config(["$resourceProvider",
    function ($resourceProvider)
    {
        $resourceProvider.defaults.actions = {
            get: {method: 'GET', withCredentials: true},
            create: {method: 'POST', withCredentials: true},
            exec: {method: 'POST', withCredentials: true},
            query: {method: 'GET', isArray: true, withCredentials: true},
            update: {method: 'PUT', withCredentials: true},
            delete: {method: 'DELETE', withCredentials: true}
        };
    }
]);

restfulApiService.factory("ApiLogin", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/login", null,
            {
                register:{method:"POST", url:testServerAddr + "api/login/managerRegister", withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiLogout", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/logout");
    }
]);


restfulApiService.factory("ApiMine", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/mine", null,
            {
                getInfo:{method:"GET", url:testServerAddr + "api/mine/info", withCredentials: true},
                getDevices:{method:"GET", url:testServerAddr + "api/mine/devices",
                    withCredentials: true},
                getAreas:{method:"GET", url:testServerAddr + "api/mine/areas",
                    isArray: true, withCredentials: true},
                getAreaDevices:{method:"GET", url:testServerAddr + "api/mine/areas/:areaId/devices",
                    isArray: true, withCredentials: true},
                getRecords:{method:"GET", url:testServerAddr + "api/mine/records/:type",
                    withCredentials: true},
                getInviteCodes:{method:"GET", url:testServerAddr + "api/mine/inviteCodes", isArray: true,
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiMineDevice", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/mine/devices/:deviceCode", {deviceCode:"@code"},
            {
                getPlugs:{method:"GET", url:testServerAddr + "api/mine/devices/:deviceCode/plugs",
                    isArray: true, withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiReport", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/report", null,
            {
                getAnnualReport:{method:"GET", url:testServerAddr + "api/report/year/:year",
                    isArray: true, withCredentials: true},
                getMonthlyReport:{method:"GET", url:testServerAddr + "api/report/year/:year/month/:month",
                    isArray: true, withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiManager", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/managers/:managerId", {managerId:"@id"},
            {
                getAreas:{method:"GET", url:testServerAddr + "api/managers/:managerId/areas",
                    isArray: true, withCredentials: true},
                setAreas:{method:"PUT", url:testServerAddr + "api/managers/:managerId/areas",
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiArea", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/areas/:areaId", {areaId:"@id"},
            {
                configDevices:{method:"PUT", url:testServerAddr + "api/areas/:areaId/devices",
                    withCredentials: true},
                getDeviceParam:{method:"GET", url:testServerAddr + "api/areas/:areaId/deviceParam",
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiRecord", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/records/:type");
    }
]);

restfulApiService.factory("ApiCustom", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/customs/:customId", {customId:"@id"},
            {
                getRecords:{method:"GET", url:testServerAddr + "api/customs/:customId/records/:type",
                    withCredentials: true},
                refund:{method:"POST", url:testServerAddr + "api/customs/:customId/refund",
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiDevice", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/devices/:deviceCode", {deviceCode:"@code"},
            {
                repair:{method:"POST", url:testServerAddr + "api/devices/:deviceCode/repair",
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiFinance", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/finance", null,
            {
                getMonthlyFinance:{method:"GET", url:testServerAddr + "api/finance/year/:year/month/:month",
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiCard", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/cards/:cardId", {cardId:"@id"},
            {
                addCard:{method:"POST", url:testServerAddr + "api/cards",
                    withCredentials: true},
                recharge:{method:"POST", url:testServerAddr + "api/cards/:cardId/recharge",
                    withCredentials: true}
            }
        );
    }
]);

var toolService = angular.module("toolService", []);

toolService.factory("Random", function () {
        return {
            getString: function (len) {
                len = len || 32;
                var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                var maxPos = chars.length;
                var randomString = "";
                for (i = 0; i < len; i++) {
                    randomString += chars.charAt(Math.floor(Math.random() * maxPos));
                }
                return randomString;
            }
        };
    }
);
