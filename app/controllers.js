/**
 * Created by madongfang on 2016/9/1.
 */

appControllers = angular.module("appControllers", ["ui.router"]);

appControllers.controller("LoginController", ["$scope", "md5", "$state", "ApiLogin",
    function ($scope, md5, $state, ApiLogin) {
        $scope.doLogin = function (username, password) {
            ApiLogin.exec({username: username, loginCode: md5.createHash(password.toUpperCase())},
                function (response) {
                    $state.go("main.device");
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

appControllers.controller("ManagerRegisterController", ["$scope", "$state", "ApiLogin",
    function ($scope, $state, ApiLogin) {
        $scope.managerRegister = function ()
        {
            ApiLogin.register({username:$scope.username, inviteCode:$scope.inviteCode},
                function (response) {
                    $state.go("main.device");
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

appControllers.controller("MainController", ["$scope", "$state", "ApiLogout", "ApiMine",
    function ($scope, $state, ApiLogout, ApiMine) {
        $scope.manager = ApiMine.getInfo(
            function (response) {},
            function (response) {
                alert(response.data.returnMsg);
                $state.go("login");
            }
        );

        $scope.doLogout = function () {
            ApiLogout.exec();
        };
    }
]);

appControllers.controller("DevicesController", ["$scope", "$state", "ApiMine", "ApiMineDevice", "$cacheFactory",
    "ApiDevice", "$uibModal",
    function ($scope, $state, ApiMine, ApiMineDevice, $cacheFactory, ApiDevice, $uibModal) {
        var areaIds = [];
        var deviceCode = "";
        var location = "";
        $scope.devices = [];
        $scope.$watch("checkboxes.checked", function (newValue, oldValue, scope) {
            angular.forEach($scope.devices, function(item) {
                $scope.checkboxes.items[item.code] = newValue;
            });
        });

        $scope.areas = ApiMine.getAreas(
            function () {},
            function (response)
            {
                alert(response.data.returnMsg);
                if (response.status == 401)
                {
                    $state.go("login");
                }
            }
        );

        var deviceCache = $cacheFactory.get("deviceCache");
        if (!deviceCache)
        {
            deviceCache = $cacheFactory("deviceCache");
        }

        $scope.size = 50; // 每页的记录数
        if (deviceCache.get("currentPage"))
        {
            $scope.currentPage = Number(deviceCache.get("currentPage"));
        }
        else
        {
            $scope.currentPage = 1; // 当前页,从1开始
        }
        if (deviceCache.get("areaIds"))
        {
            areaIds = deviceCache.get("areaIds");
            $scope.select = {areaIds:areaIds};
        }
        else
        {
            $scope.select = {areaIds:[]};
        }
        if (deviceCache.get("deviceCode"))
        {
            deviceCode = $scope.deviceCode = deviceCache.get("deviceCode");
        }
        else
        {
            $scope.deviceCode = "";
        }
        if (deviceCache.get("location"))
        {
            location = $scope.location = deviceCache.get("location");
        }
        else
        {
            $scope.location = "";
        }

        $scope.totalItems = $scope.currentPage * $scope.size;
        $scope.inusePlugNumber = 0;
        $scope.inusePlugConsumePower = 0;
        $scope.aliveDeviceNumber = 0;

        $scope.pageChanged = function ()
        {
            $scope.checkboxes = {checked:false,items:{}};
            deviceCache.put("currentPage", $scope.currentPage.toString());
            ApiMine.getDevices(
                {
                    size:$scope.size,
                    page:$scope.currentPage - 1,
                    areaIds:areaIds,
                    deviceCode:deviceCode,
                    location:location
                },
                function (data)
                {
                    $scope.totalItems = data.totalElements; // 总记录数
                    $scope.devices = data.content;
                    $scope.inusePlugNumber = data.totalInusePlugNumber;
                    $scope.inusePlugConsumePower = data.totalInusePlugConsumePower;
                    $scope.aliveDeviceNumber = data.aliveDeviceNumber;
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };

        $scope.pageChanged();

        $scope.searchDevice = function ()
        {
            deviceCache.put("areaIds", $scope.select.areaIds);
            deviceCache.put("deviceCode", $scope.deviceCode);
            deviceCache.put("location", $scope.location);

            areaIds = $scope.select.areaIds;
            deviceCode = $scope.deviceCode;
            location = $scope.location;
            $scope.currentPage = 1;
            $scope.pageChanged();
        };

        $scope.repair = function (code)
        {
            if (confirm("维修将会转移原有充电记录到虚拟设备并将现有设备转移到'维修设备'小区,确定维修?"))
            {
                ApiDevice.repair(
                    {
                        deviceCode:code
                    },
                    null,
                    function (data)
                    {
                        $scope.pageChanged();
                    },
                    function (response) {
                        alert(response.data.returnMsg);
                    }
                );
            }
        };

        function batchUpdate(deviceBatchApi)
        {
            var deviceCodes = [];
            angular.forEach($scope.devices, function(device)
            {
                if ($scope.checkboxes.items[device.code])
                {
                    deviceCodes.push(device.code);
                }
            });
            deviceBatchApi.deviceCodes = deviceCodes;
            ApiMineDevice.update(null, deviceBatchApi,
                function (data)
                {
                    $scope.pageChanged();
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        }

        $scope.modifyUnitPrice = function ()
        {
            var value = prompt("请输入单位电费(元/度):", "2.00");
            if (value != null && value != "")
            {
                value = (Number(value) * 100).toFixed(0);
                batchUpdate({unitPrice: value});
            }
        };
        $scope.modifyMinPrice = function ()
        {
            var value = prompt("请输入最低电费(元):", "0.00");
            if (value != null && value != "")
            {
                value = (Number(value) * 100).toFixed(0);
                batchUpdate({minPrice: value});
            }
        };
        $scope.modifyAttachPrice = function ()
        {
            var value = prompt("请输入附加收费(元):", "0.00");
            if (value != null && value != "")
            {
                value = (Number(value) * 100).toFixed(0);
                batchUpdate({attachPrice: value});
            }
        };
        $scope.modifyOverdraft = function ()
        {
            var value = prompt("请输入透支系数:", "1.000");
            if (value != null && value != "")
            {
                value = (Number(value) * 1000).toFixed(0);
                batchUpdate({overdraft: value});
            }
        };
        $scope.modifyFloatChargeTime = function ()
        {
            var value = prompt("请输入浮充充电时间(分钟):", "120");
            if (value != null && value != "")
            {
                value = Number(value).toFixed(0);
                batchUpdate({floatChargeTime: value});
            }
        };
        $scope.modifyArea = function ()
        {
            $uibModal.open({
                templateUrl: "modifyAreaModal.html",
                backdrop:"static",
                scope:$scope,
                controller: ["$scope", "$uibModalInstance",
                    function ($scope, $uibModalInstance)
                    {
                        $scope.areaId = $scope.areas[0].id;
                        $scope.confirm = function ()
                        {
                            batchUpdate({areaId: $scope.areaId});
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function ()
                        {
                            $uibModalInstance.dismiss();
                        };
                    }
                ]
            });
        };
    }
]);

appControllers.controller("DevicePlugsController", ["$scope", "$stateParams", "ApiMineDevice",
    function ($scope, $stateParams, ApiMineDevice) {
        $scope.deviceCode = $stateParams.deviceCode;
        $scope.plugs = ApiMineDevice.getPlugs({deviceCode:$stateParams.deviceCode},
            function (data) {},
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );
    }
]);

appControllers.controller("DeviceConfigController", ["$scope", "$state", "$stateParams", "ApiMine", "ApiMineDevice",
    function ($scope, $state, $stateParams, ApiMine, ApiMineDevice) {
        $scope.areas = ApiMine.getAreas(
            function () {},
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.deviceTypeOptions = [{type:"power",label:"计电量型"}, {type:"time",label:"计时型"}];

        $scope.device = ApiMineDevice.get({deviceCode: $stateParams.deviceCode},
            function ()
            {
                $scope.factor = $scope.device.factor / 1000;
                $scope.unitPrice = $scope.device.unitPrice / 100;
                $scope.minPrice = $scope.device.minPrice / 100;
                $scope.attachPrice = $scope.device.attachPrice / 100;
                if ($scope.device.overdraft)
                {
                    $scope.overdraft = $scope.device.overdraft / 1000;
                }
                else
                {
                    $scope.overdraft = 1;
                }
                $scope.minTime = $scope.device.unitPrice * $scope.minPrice / 60;
            },
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.doConfig = function ()
        {
            $scope.device.factor = $scope.factor * 1000;
            $scope.device.minPrice = $scope.minPrice * 100;
            $scope.device.attachPrice = $scope.attachPrice * 100;
            $scope.device.overdraft = $scope.overdraft * 1000;
            if ($scope.device.type == 'time')
            {
                $scope.device.unitPrice = Math.round($scope.minTime * 60 / $scope.minPrice);
            }
            else
            {
                $scope.device.unitPrice = $scope.unitPrice * 100;
            }
            $scope.device.$update(
                function ()
                {
                    $state.go("main.device");
                },
                function (response)
                {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

appControllers.controller("ReportController", ["$scope", "ApiMine", "ApiReport", "ApiMineDevice",
    function ($scope, ApiMine, ApiReport, ApiMineDevice) {
        var now = new Date();
        var reportOption = {};
        $scope.yearOptions = [];
        $scope.monthOptions = [];
        $scope.areaOptions = [{id:0, name:"所有"}];
        $scope.deviceOptions = [{code:null, location:"所有"}];
        $scope.plugOptions = [{id:0, label:"所有"}];
        $scope.select = {year:now.getFullYear(), month:now.getMonth()+1, areaId:0, deviceCode:null, plugId:0};
        $scope.disableDeviceOption = true;
        $scope.disablePlugOption = true;
        $scope.reportCaption = "统计报表";

        for (var year = 2016; year <= now.getFullYear(); year++)
        {
            $scope.yearOptions.push({year:year, label:year+"年"});
        }

        $scope.setMonthOptions = function ()
        {
            var maxMonth = 0;
            $scope.monthOptions = [{month:0, label:"全年"}];
            if ($scope.select.year == now.getFullYear())
            {
                maxMonth = now.getMonth()+1;
            }
            else if ($scope.select.year < now.getFullYear())
            {
                maxMonth = 12;
            }
            else
            {
                maxMonth = 0;
            }

            if ($scope.select.month > maxMonth)
            {
                $scope.select.month = 0;
            }

            for (var month = 1; month <= maxMonth; month++)
            {
                $scope.monthOptions.push({month:month, label:month+"月"});
            }
        };

        $scope.setMonthOptions();

        ApiMine.getAreas(
            function (data)
            {
                $scope.areaOptions = $scope.areaOptions.concat(data);
            },
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );
        $scope.setDevicePlugOptions = function ()
        {
            if ($scope.select.areaId == 0)
            {
                $scope.disableDeviceOption = true;
                $scope.select.deviceCode = null;

                $scope.disablePlugOption = true;
                $scope.select.plugId = 0;
            }
            else
            {
                ApiMine.getAreaDevices({areaId:$scope.select.areaId},
                    function (data)
                    {
                        $scope.deviceOptions = [{code:null, location:"所有"}].concat(data);
                        $scope.disableDeviceOption = false;
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }
        };

        $scope.setPlugOptions = function ()
        {
            if ($scope.select.deviceCode == null)
            {
                $scope.disablePlugOption = true;
                $scope.select.plugId = 0;
            }
            else
            {
                ApiMineDevice.getPlugs({deviceCode:$scope.select.deviceCode},
                    function (data)
                    {
                        $scope.plugOptions = [{id:0, label:"所有"}];
                        for (var i = 0; i < data.length; i++)
                        {
                            $scope.plugOptions.push({id:data[i].id, label:data[i].id.toString()});
                        }
                        $scope.disablePlugOption = false;
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }
        };

        $scope.search = function ()
        {
            var reportCaption = "";
            var i;
            reportOption = {year:$scope.select.year};
            if ($scope.select.areaId != 0)
            {
                reportOption.areaId = $scope.select.areaId;
                for (i = 0; i < $scope.areaOptions.length; i++)
                {
                    if ($scope.areaOptions[i].id == reportOption.areaId)
                    {
                        reportCaption += $scope.areaOptions[i].name;
                        break;
                    }
                }
            }
            if ($scope.select.deviceCode != null)
            {
                reportOption.deviceCode = $scope.select.deviceCode;
                for (i = 0; i < $scope.deviceOptions.length; i++)
                {
                    if ($scope.deviceOptions[i].code == reportOption.deviceCode)
                    {
                        reportCaption += $scope.deviceOptions[i].location;
                        break;
                    }
                }
            }
            if ($scope.select.plugId != 0)
            {
                reportOption.plugId = $scope.select.plugId;
                reportCaption += (reportOption.plugId + "号插座");
            }

            if ($scope.select.month == 0) // 年报
            {
                reportCaption += (" " + reportOption.year + "年 年报");
                $scope.report = ApiReport.getAnnualReport(reportOption,
                    function (data)
                    {
                        $scope.reportCaption = reportCaption;
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }
            else // 月报
            {
                reportOption.month = $scope.select.month;
                reportCaption += (" " + reportOption.year + "年" + reportOption.month + "月 月报");
                $scope.report = ApiReport.getMonthlyReport(reportOption,
                    function (data)
                    {
                        $scope.reportCaption = reportCaption;
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }

        };

        $scope.search();

        $scope.exportExcel = function ()
        {
            var url = testServerAddr + "api/report/year/"+reportOption.year;
            if (reportOption.month)
            {
                url += ("/month/" + reportOption.month);
            }
            url += "/excel";

            if (reportOption.areaId)
            {
                url += ("?areaId="+reportOption.areaId);
                if (reportOption.deviceCode)
                {
                    url += ("&deviceCode="+reportOption.deviceCode);
                    if (reportOption.plugId)
                    {
                        url += ("&plugId="+reportOption.plugId);
                    }
                }
            }

            window.open(url, "_self");
        }
    }
]);

appControllers.controller("ManagersController", ["$scope", "ApiManager", "$uibModal",
    function ($scope, ApiManager, $uibModal) {
        $scope.managers = ApiManager.query(
            function (response) {},
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.getInviteCodes = function ()
        {
            $uibModal.open({
                templateUrl: "inviteCodeModal.html",
                backdrop:"static",
                scope:$scope,
                controller: ["$scope", "$uibModalInstance", "ApiMine",
                    function ($scope, $uibModalInstance, ApiMine)
                    {
                        $scope.inviteCodes = [];
                        $scope.level = 1;
                        $scope.number = 1;
                        $scope.levelOptions = [{level:1,label:"1级"},{level:2,label:"2级"},{level:3,label:"3级"},{level:4,label:"4级"}];
                        $scope.getInviteCodes = function ()
                        {
                            if ($scope.number < 1)
                            {
                                alert("邀请码数量不能小于1");
                                return;
                            }

                            $scope.inviteCodes = ApiMine.getInviteCodes({level:$scope.level, number:$scope.number},
                                function (data) {},
                                function (response)
                                {
                                    alert(response.data.returnMsg);
                                }
                            );
                        };
                        $scope.close = function ()
                        {
                            $uibModalInstance.dismiss();
                        };
                    }
                ]
            });
        };
    }
]);

appControllers.controller("ManagerConfigController", ["$scope", "$state", "$stateParams", "ApiManager", "ApiArea",
    function ($scope, $state, $stateParams, ApiManager, ApiArea) {
        $scope.checkboxes = {checkedAll:false,items:{}};

        $scope.$watch("checkboxes.checkedAll", function (newValue, oldValue, scope) {
            angular.forEach($scope.areas, function(area) {
                $scope.checkboxes.items[area.id] = newValue;
            });
        });

        $scope.manager = ApiManager.get({managerId: $stateParams.managerId},
            function () {},
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.areas = ApiArea.query(
            function ()
            {
                angular.forEach($scope.areas, function(area) {
                    $scope.checkboxes.items[area.id] = false;
                });
                ApiManager.getAreas({managerId: $stateParams.managerId},
                    function (areas)
                    {
                        angular.forEach(areas, function(area) {
                            $scope.checkboxes.items[area.id] = true;
                        });
                        if (areas.length == $scope.areas.length)
                        {
                            $scope.checkboxes.checkedAll = true;
                        }
                        else
                        {
                            $scope.checkboxes.checkedAll = false;
                        }
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            },
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.doConfig = function ()
        {
            $scope.manager.$update(
                function (data) {},
                function (response)
                {
                    alert(response.data.returnMsg);
                }
            );

            var checkedAreas = [];
            angular.forEach($scope.areas, function(area) {
                if ($scope.checkboxes.items[area.id])
                {
                    checkedAreas.push(area);
                }
            });

            ApiManager.setAreas(
                {managerId: $stateParams.managerId},
                checkedAreas,
                function (data) {
                    $state.go("main.manager");
                },
                function (response)
                {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

appControllers.controller("ChargeRecordsController", ["$scope", "$state", "ApiMine",
    function ($scope, $state, ApiMine) {
        $scope.areas = ApiMine.getAreas(
            function () {},
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        var areaIds = [];
        var deviceCode = "";
        var location = "";
        var startTime = null;
        var stopTime = null;
        $scope.select = {areaIds:[]};
        $scope.deviceCode = "";
        $scope.location = "";
        $scope.startTime = null;
        $scope.stopTime = null;

        $scope.size = 50; // 每页的记录数
        $scope.currentPage = 1; // 当前页,从1开始

        $scope.pageChanged = function ()
        {
            ApiMine.getRecords(
                {
                    type:"charge",
                    size:$scope.size,
                    page:$scope.currentPage - 1,
                    areaIds:areaIds,
                    deviceCode:deviceCode,
                    location:location,
                    startTime:startTime != null ? startTime.getTime() : null,
                    stopTime:stopTime != null ? stopTime.getTime() : null
                },
                function (data)
                {
                    $scope.totalItems = data.totalElements; // 总记录数
                    $scope.chargeRecords = data.content;
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };

        $scope.pageChanged();

        $scope.search = function ()
        {
            areaIds = $scope.select.areaIds;
            deviceCode = $scope.deviceCode;
            location = $scope.location;
            startTime = $scope.startTime;
            if (startTime != null)
            {
                startTime.setHours(0,0,0,0);
            }
            stopTime = $scope.stopTime;
            if (stopTime != null)
            {
                stopTime.setHours(23,59,59,999);
            }
            $scope.currentPage = 1;
            $scope.pageChanged();
        };
    }
]);

appControllers.controller("AreasController", ["$scope", "ApiArea", "$cacheFactory", "$uibModal",
    function ($scope, ApiArea, $cacheFactory, $uibModal) {
        var areaCache = $cacheFactory.get("areaCache");
        if (!areaCache)
        {
            areaCache = $cacheFactory("areaCache");
        }

        $scope.size = 50; // 每页的记录数
        if (areaCache.get("currentPage"))
        {
            $scope.currentPage = Number(areaCache.get("currentPage"));
        }
        else
        {
            $scope.currentPage = 1; // 当前页,从1开始
        }
        $scope.totalItems = $scope.currentPage * $scope.size;

        $scope.pageChanged = function ()
        {
            areaCache.put("currentPage", $scope.currentPage.toString());
            ApiArea.get(
                {
                    size:$scope.size,
                    page:$scope.currentPage - 1
                },
                function (data)
                {
                    $scope.totalItems = data.totalElements; // 总记录数
                    $scope.areas = data.content;
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };

        $scope.pageChanged();

        $scope.deleteArea = function (areaId)
        {
            if (confirm("确定删除？"))
            {
                ApiArea.delete({areaId:areaId},
                    function ()
                    {
                        location.reload();
                    },
                    function (response) {
                        alert(response.data.returnMsg);
                    }
                );
            }
        };

        $scope.configDevice = function (area)
        {
            $uibModal.open({
                templateUrl: "areaDeviceConfigModal.html",
                backdrop:"static",
                scope:$scope,
                controller: ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance)
                {
                    $scope.areaName = area.name;

                    ApiArea.getDeviceParam({areaId:area.id},
                        function (data) {
                            $scope.unitPrice = data.unitPrice/100;
                            $scope.minPrice = data.minPrice/100;
                            $scope.attachPrice = data.attachPrice/100;
                            $scope.overdraft = (data.overdraft || 1000)/1000 ;
                            $scope.floatChargeTime = data.floatChargeTime;
                        },
                        function (response) {
                            $scope.unitPrice = 2;
                            $scope.minPrice = 0;
                            $scope.attachPrice = 0;
                            $scope.overdraft = 1;
                            $scope.floatChargeTime = 120;
                        }
                    );

                    $scope.doConfig = function ()
                    {
                        var deviceParam = {
                            unitPrice: $scope.unitPrice * 100,
                            minPrice: $scope.minPrice * 100,
                            attachPrice: $scope.attachPrice * 100,
                            overdraft: $scope.overdraft * 1000,
                            floatChargeTime: $scope.floatChargeTime
                        };
                        ApiArea.configDevices({areaId:area.id}, deviceParam,
                            function () {
                                $uibModalInstance.close();
                            },
                            function (response) {
                                alert(response.data.returnMsg);
                            }
                        );
                    };
                    $scope.cancel = function ()
                    {
                        $uibModalInstance.dismiss();
                    };
                }]
            });
        };
    }
]);

appControllers.controller("AreaConfigController", ["$scope", "$state", "$stateParams", "ApiArea",
    function ($scope, $state, $stateParams, ApiArea) {
        $scope.area = {name:""};

        var newDevice = false;
        if ($stateParams.areaId == "new")
        {
            newDevice = true;
        }
        if (!newDevice)
        {
            $scope.area = ApiArea.get({areaId:$stateParams.areaId},
                function () {},
                function (response)
                {
                    alert(response.data.returnMsg);
                }
            );
        }

        $scope.doConfig = function ()
        {
            if (newDevice)
            {
                ApiArea.create($scope.area,
                    function ()
                    {
                        $state.go("main.area");
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }
            else
            {
                $scope.area.$update(
                    function ()
                    {
                        $state.go("main.area");
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }
        };
    }
]);

appControllers.controller("CustomsController", ["$scope", "ApiCustom", "$cacheFactory", "$uibModal",
    function ($scope, ApiCustom, $cacheFactory, $uibModal) {
        var nickname = "";
        $scope.nickname = "";

        var customCache = $cacheFactory.get("customCache");
        if (!customCache)
        {
            customCache = $cacheFactory("customCache");
        }

        $scope.size = 50; // 每页的记录数
        if (customCache.get("currentPage"))
        {
            $scope.currentPage = Number(customCache.get("currentPage"));
        }
        else
        {
            $scope.currentPage = 1; // 当前页,从1开始
        }
        $scope.totalItems = $scope.currentPage * $scope.size;

        $scope.pageChanged = function ()
        {
            customCache.put("currentPage", $scope.currentPage.toString());
            ApiCustom.get(
                {
                    size:$scope.size,
                    page:$scope.currentPage - 1,
                    nickname:nickname
                },
                function (data)
                {
                    $scope.totalItems = data.totalElements; // 总记录数
                    $scope.customs = data.content;
                    $scope.totalBalance = data.totalBalance;
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };

        $scope.pageChanged();

        $scope.search = function ()
        {
            nickname = $scope.nickname;
            $scope.currentPage = 1;
            $scope.pageChanged();
        };

        $scope.refund = function (customId)
        {
            var modalInstance = $uibModal.open({
                templateUrl: "customRefundModal.html",
                backdrop:"static",
                scope:$scope,
                controller: ["$scope", "$uibModalInstance", "md5",
                    function ($scope, $uibModalInstance, md5)
                    {
                        $scope.doRefund = function ()
                        {
                            ApiCustom.refund({customId:customId},
                                {
                                    amount:Math.round($scope.refundAmount * 100),
                                    reason:$scope.refundReason,
                                    password:md5.createHash($scope.refundPassword)
                                },
                                function (data)
                                {
                                    $uibModalInstance.close();
                                },
                                function (response) {
                                    alert(response.data.returnMsg);
                                }
                            );
                        };
                        $scope.cancel = function ()
                        {
                            $uibModalInstance.dismiss();
                        };
                    }
                ]
            });

            modalInstance.result.then(
                function (result)
                {
                    $scope.pageChanged();
                },
                function (reason) {}
            );
        };
    }
]);

appControllers.controller("CustomDetailController", ["$scope", "$state", "$stateParams", "ApiCustom",
    function ($scope, $state, $stateParams, ApiCustom) {
        $scope.custom = ApiCustom.get({customId:$stateParams.customId},
            function (data) {},
            function (response) {
                alert(response.data.returnMsg);
            }
        );

        $scope.size = 50; // 每页的记录数
        $scope.currentPage = 1; // 当前页,从1开始

        var billCurrentPage = 1;
        var paymentCurrentPage = 1;
        var chargeCurrentPage = 1;
        var currentType = "";

        $scope.pageChanged = function ()
        {
            switch (currentType)
            {
                case "bill":
                    billCurrentPage = $scope.currentPage;
                    break;
                case "payment":
                    paymentCurrentPage = $scope.currentPage;
                    break;
                case "charge":
                    chargeCurrentPage = $scope.currentPage;
                    break;
                default :
                    break;
            }

            ApiCustom.getRecords(
                {
                    customId:$stateParams.customId,
                    type:currentType,
                    size:$scope.size,
                    page:$scope.currentPage - 1
                },
                function (data)
                {
                    $scope.totalItems = data.totalElements; // 总记录数
                    $scope.records = data.content;
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };

        $scope.selectTab = function (type)
        {
            currentType = type;
            switch (currentType)
            {
                case "bill":
                    $scope.currentPage = billCurrentPage;
                    break;
                case "payment":
                    $scope.currentPage = paymentCurrentPage;
                    break;
                case "charge":
                    $scope.currentPage = chargeCurrentPage;
                    break;
                default :
                    $scope.currentPage = 1;
                    break;
            }
            $scope.pageChanged();
        }
    }
]);

appControllers.controller("FinanceController", ["$scope", "ApiFinance",
    function ($scope, ApiFinance) {
        $scope.caption = "财务报表";
        $scope.totalSplitAmount = 0;
        var now = new Date();
        $scope.yearOptions = [];
        $scope.monthOptions = [];
        $scope.select = {year:now.getFullYear(), month:now.getMonth()+1};
        for (var year = 2016; year <= now.getFullYear(); year++)
        {
            $scope.yearOptions.push({year:year, label:year+"年"});
        }
        $scope.setMonthOptions = function ()
        {
            var maxMonth = 0;
            $scope.monthOptions = [{month:0, label:"全年"}];
            if ($scope.select.year == now.getFullYear())
            {
                maxMonth = now.getMonth()+1;
            }
            else if ($scope.select.year < now.getFullYear())
            {
                maxMonth = 12;
            }
            else
            {
                maxMonth = 0;
            }

            if ($scope.select.month > maxMonth)
            {
                $scope.select.month = 0;
            }

            for (var month = 1; month <= maxMonth; month++)
            {
                $scope.monthOptions.push({month:month, label:month+"月"});
            }
        };

        $scope.setMonthOptions();

        $scope.search = function ()
        {
            if ($scope.select.month == 0)
            {
                alert("暂时不支持年度财务报表的查询,请选择月份!");
                return;
            }

            var financeOption = {year:$scope.select.year, month:$scope.select.month};
            $scope.finance = ApiFinance.getMonthlyFinance(financeOption,
                function (data)
                {
                    $scope.caption = financeOption.year + "年" + financeOption.month + "月 财务报表";
                    $scope.totalSplitAmount = 0;
                    for (var i = 0; i < $scope.finance.managerSplits.length; i++)
                    {
                        $scope.totalSplitAmount += $scope.finance.managerSplits[i].splitAmount;
                    }
                },
                function (response)
                {
                    alert(response.data.returnMsg);
                }
            );
        };

        $scope.search();
    }
]);

appControllers.controller("CardInfoController", ["$scope", "$stateParams", "ApiCard",
    function ($scope, $stateParams, ApiCard) {
        $scope.card = ApiCard.get({cardId:$stateParams.cardId},
            function () {},
            function (response)
            {
                if (confirm("该卡(" + $stateParams.cardId + ")尚未录入系统中,是否录入?"))
                {
                    ApiCard.addCard(null,
                        {id:$stateParams.cardId, balance:0},
                        function ()
                        {
                            location.reload();
                        },
                        function (response)
                        {
                            alert(response.data.returnMsg);
                        });
                }
            }
        );

        $scope.recharge = function ()
        {
            var amount = prompt("请输入充值金额(元):", "0.00");
            if (amount)
            {
                ApiCard.recharge({cardId:$stateParams.cardId},
                    {amount:(amount * 100).toFixed(0)},
                    function ()
                    {
                        location.reload();
                    },
                    function (response)
                    {
                        alert(response.data.returnMsg);
                    }
                );
            }
        };
    }
]);
