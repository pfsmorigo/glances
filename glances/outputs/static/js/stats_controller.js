glancesApp.controller('statsController', function ($scope, $interval, $routeParams, GlancesStats) {
    $scope.refreshTime = 3;
    $scope.sorter = {
        column: "cpu_percent",
        auto: true,
        isReverseColumn: function (column) {
            return !(column == 'username' || column == 'name');
        },
        getColumnLabel: function (column) {
            if (_.isEqual(column, ['io_read', 'io_write'])) {
                return 'io_counters';
            } else {
                return column;
            }
        }
    };
    $scope.help_screen = false;
    $scope.show = {
        'diskio': true,
        'network': true,
        'fs': true,
        'sensors': true,
        'sidebar': true,
        'alert': true,
        'short_process_name': true,
        'per_cpu': false,
        'warning_alerts': true,
        'warning_critical_alerts': true,
        'process_stats': true,
        'top_extended_stats': true,
        'docker_stats': true,
        'network_io_combination': false,
        'network_io_cumulative': false,
        'filesystem_freespace': false,
        'network_by_bytes': false
    };

    $scope.init_refresh_time = function () {
        if ($routeParams != undefined && $routeParams.refresh_time != undefined) {
            var new_refresh_time = parseInt($routeParams.refresh_time);
            if (new_refresh_time >= 1) {
                $scope.refreshTime = new_refresh_time
            }
        }
    };

    $scope.show_hide = function (bloc) {
        if (bloc == 'help') {
            $scope.help_screen = !$scope.help_screen
        } else {
            $scope.show[bloc] = !$scope.show[bloc]
        }
    };

    $scope.dataLoaded = false;
    $scope.refreshData = function () {
        GlancesStats.getData().then(function (data) {

            $scope.statsAlert = GlancesStats.getPlugin('alert');
            $scope.statsCpu = GlancesStats.getPlugin('cpu');
            $scope.statsDiskio = GlancesStats.getPlugin('diskio');
            $scope.statsDocker = GlancesStats.getPlugin('docker');
            $scope.statsFs = GlancesStats.getPlugin('fs');
            $scope.statsIp = GlancesStats.getPlugin('ip');
            $scope.statsLoad = GlancesStats.getPlugin('load');
            $scope.statsMem = GlancesStats.getPlugin('mem');
            $scope.statsMemSwap = GlancesStats.getPlugin('memswap');
            $scope.statsMonitor = GlancesStats.getPlugin('monitor');
            $scope.statsNetwork = GlancesStats.getPlugin('network');
            $scope.statsPerCpu = GlancesStats.getPlugin('percpu');
            $scope.statsProcessCount = GlancesStats.getPlugin('processcount');
            $scope.statsProcessList = GlancesStats.getPlugin('processlist');
            $scope.statsSensors = GlancesStats.getPlugin('sensors');
            $scope.statsSystem = GlancesStats.getPlugin('system');
            $scope.statsUptime = GlancesStats.getPlugin('uptime');

            $scope.is_disconnected = false;
            $scope.dataLoaded = true;
        }, function() {
            $scope.is_disconnected = true;
        });
    };

    $scope.init_refresh_time();
    GlancesStats.getHelp().then(function (help) {
        $scope.help = help;
    });

    var stop;
    $scope.configure_refresh = function () {
        if (!angular.isDefined(stop)) {
            stop = $interval(function () {
                $scope.refreshData();
            }, $scope.refreshTime * 1000); // in milliseconds
        }
    };

    $scope.$watch(
        function () {
            return $scope.refreshTime;
        },
        function (newValue, oldValue) {
            $scope.stop_refresh();
            $scope.configure_refresh();
        }
    );

    $scope.stop_refresh = function () {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.$on('$destroy', function () {
        $scope.stop_refresh();
    });

    $scope.onKeyDown = function ($event) {
        if ($event.keyCode == keycodes.a) { // a  Sort processes automatically
            $scope.sorter.column = "cpu_percent";
            $scope.sorter.auto = true;
        } else if ($event.keyCode == keycodes.c) {//c  Sort processes by CPU%
            $scope.sorter.column = "cpu_percent";
            $scope.sorter.auto = false;
        } else if ($event.keyCode == keycodes.m) {//m  Sort processes by MEM%
            $scope.sorter.column = "memory_percent";
            $scope.sorter.auto = false;
        } else if ($event.keyCode == keycodes.p) {//p  Sort processes by name
            $scope.sorter.column = "name";
            $scope.sorter.auto = false;
        } else if ($event.keyCode == keycodes.i) {//i  Sort processes by I/O rate
            $scope.sorter.column = ['io_read', 'io_write'];
            $scope.sorter.auto = false;
        } else if ($event.keyCode == keycodes.t && !$event.shiftKey) {//t  Sort processes by CPU times
            $scope.sorter.column = "timemillis";
            $scope.sorter.auto = false;
        } else if ($event.keyCode == keycodes.u && !$event.shiftKey) {//t  Sort processes by user
            $scope.sorter.column = "username";
            $scope.sorter.auto = false;
        } else if ($event.keyCode == keycodes.d) {//d  Show/hide disk I/O stats
            $scope.show_hide('diskio')
        } else if ($event.keyCode == keycodes.f) {//f  Show/hide filesystem stats
            $scope.show_hide('fs')
        } else if ($event.keyCode == keycodes.n) {//n sort_by Show/hide network stats
            $scope.show_hide('network')
        } else if ($event.keyCode == keycodes.s) {//s  Show/hide sensors stats
            $scope.show_hide('sensors')
        } else if ($event.keyCode == keycodes.TWO && $event.shiftKey) {//2  Show/hide left sidebar
            $scope.show_hide('sidebar')
        } else if ($event.keyCode == keycodes.z) {//z  Enable/disable processes stats
            $scope.show_hide('process_stats')
        } else if ($event.keyCode == keycodes.e) {//e  Enable/disable top extended stats
            $scope.show_hide('top_extended_stats')
        } else if ($event.keyCode == keycodes.SLASH) {// SLASH  Enable/disable short processes name
            $scope.show_hide('short_process_name')
        } else if ($event.keyCode == keycodes.D && $event.shiftKey) {//D  Enable/disable Docker stats
            $scope.show_hide('docker_stats')
        } else if ($event.keyCode == keycodes.b) {//b  Bytes or bits for network I/O
            $scope.show_hide('network_by_bytes')
        } else if ($event.keyCode == keycodes.l) {//l  Show/hide alert logs
            $scope.show_hide('alert')
        } else if ($event.keyCode == keycodes.w) {//w  Delete warning alerts
            $scope.show_hide('warning_alerts')
        } else if ($event.keyCode == keycodes.x) {//x  Delete warning and critical alerts
            $scope.show_hide('warning_critical_alerts')
        } else if ($event.keyCode == keycodes.ONE && $event.shiftKey) {//1  Global CPU or per-CPU stats
            $scope.show_hide('per_cpu')
        } else if ($event.keyCode == keycodes.h) {//h  Show/hide this help screen
            $scope.show_hide('help')
        } else if ($event.keyCode == keycodes.T && $event.shiftKey) {//T  View network I/O as combination
            $scope.show_hide('network_io_combination')
        } else if ($event.keyCode == keycodes.u && $event.shiftKey) {//U  View cumulative network I/O
            $scope.show_hide('network_io_cumulative')
        } else if ($event.keyCode == keycodes.F && $event.shiftKey) {//F  Show filesystem free space
            $scope.show_hide('filesystem_freespace')
        } else if ($event.keyCode == keycodes.g) {//g  Generate graphs for current history
            // not available
        } else if ($event.keyCode == keycodes.r) {//r  Reset history
            // not available
        } else if ($event.keyCode == keycodes.q) {//q  Quit (Esc and Ctrl-C also work)
            // not available
        }
    };
});
