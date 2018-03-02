appFilters = angular.module("appFilters", []);

appFilters.filter("durationTime", function ()
{
    return function (input)
    {
        var mins = parseInt(input / 60);
        var hour = parseInt(mins / 60);
        var min = mins % 60;
        var str = "";
        if (hour != 0)
        {
            str += hour + "小时";
        }
        str += min + "分钟";
        return str;
    }
});

appFilters.filter("recordType", function ()
{
    return function (input)
    {
        if (input == "D")
        {
            return "开始";
        }
        else if (input == "P")
        {
            return "结束";
        }
        else if (input == "E")
        {
            return "异常";
        }
        else if (input == "Q")
        {
            return "充值";
        }
        else if (input == "S")
        {
            return "赠送";
        }
        else if (input == "T")
        {
            return "退款";
        }
        else
        {
            return input;
        }
    }
});

appFilters.filter("customType", function ()
{
    return function (input)
    {
        if (input == "W")
        {
            return "微信账户";
        }
        else if (input == "A")
        {
            return "支付宝账户";
        }
        else if (input == "C")
        {
            return "充电卡账户";
        }
        else
        {
            return input;
        }
    }
});

appFilters.filter("reportTime", ["dateFilter",
    function (dateFilter)
    {
        return function (date, type)
        {
            if (type == "year")
            {
                return dateFilter(date, "yyyy年");
            }
            else if (type == "month")
            {
                return dateFilter(date, "yyyy年M月");
            }
            else if (type == "date")
            {
                return dateFilter(date, "yyyy年M月d日");
            }
            else
            {
                return "错误:type=" + type;
            }
        }
    }
]);

appFilters.filter("billAmount", function ()
{
    return function (input)
    {
        if (input >= 0)
        {
            return "+" + input;
        }
        else
        {
            return input.toString();
        }
    }
});

appFilters.filter("plugStatus", function ()
{
    return function (input)
    {
        if (input == "E")
        {
            return "故障";
        }
        else if (input == "U")
        {
            return "使用中";
        }
        else if (input == "F")
        {
            return "空闲";
        }
        else
        {
            return input;
        }
    }
});

appFilters.filter("deviceType", function ()
{
    return function (input)
    {
        if (input == "power")
        {
            return "计电量型";
        }
        else if (input == "time")
        {
            return "计时型";
        }
        else
        {
            return "计电量型";
        }
    }
});
