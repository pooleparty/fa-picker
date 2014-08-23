if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function(str) {
        return this.indexOf(str) == 0;
    };
}

var alertContainer;
var alertCount = 0;
/**
 * angfnd Module
 *
 * Description
 */
var app = angular.module('faPickerApp', []);
app.filter('iconKeyword', function() {
    return function(list, keyword) {
        if (!keyword || keyword == '')
            return list;
        keyword = keyword.toUpperCase();
        var filtered = [];
        angular.forEach(list, function(icon) {
            if (icon.icon.toUpperCase().indexOf(keyword) >= 0)
                filtered.push(icon);
        });
        return filtered;
    }
});

app.config(function($sceProvider) {
    $sceProvider.enabled(false);
});

app.filter('splitArrayFilter', function() {
    return function(arr, lengthofsublist) {
        if (!angular.isUndefined(arr) && arr.length > 0) {
            var arrayToReturn = [];
            var subArray = [];
            var pushed = true;
            for (var i = 0; i < arr.length; i++) {
                if ((i + 1) % lengthofsublist == 0) {
                    subArray.push(arr[i]);
                    arrayToReturn.push(subArray);
                    subArray = [];
                    pushed = true;
                } else {
                    subArray.push(arr[i]);
                    pushed = false;
                }
            }
            if (!pushed)
                arrayToReturn.push(subArray);

            console.log(JSON.stringify(arrayToReturn));
            return arrayToReturn;
        }
    }
});

app.directive('pager', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/pager.html',
        scope: {
            data: '='
        },
        link: function(scope, element, attrs) {
            scope.ikeyword = '';
        }
    };
});

app.controller('faPickerController', ['$scope', '$http',
    function($scope, $http) {
        var debug = true;
        $scope.message = 'Font Awesome Icons Picker';
        $scope.icons = [];
        $scope.loading = true;
        $scope.ikeyword = '';

        $scope.selectedIcon = null;
        $scope.iconRotations = ['0', '90', '180', '270'];
        $scope.iconSizes = ['1x', 'lg', '2x', '3x', '4x', '5x'];
        $scope.iconOptions = {
            size: '4x',
            inverse: false,
            border: false,
            spin: false,
            flip_vert: false,
            flip_horiz: false,
            rotation: '0',
            color: {
                r: 10,
                g: 10,
                b: 10,
                hex: '#000000'
            }
        };
        $scope.stackedIcons = [{
            name: 'Test Icon',
            layers: [{
                id: 1,
                name: 'Base',
                icon: 'fa-facebook'
            }, {
                id: 2
            }]
        }];
        $scope.selectedStackedIcon = null;
        $scope.setSelectedStackedIcon = function(stackedIcon) {
            $scope.selectedStackedIcon = stackedIcon;
            $scope.selectedIcon = null;
        };
        $scope.deleteStackedIcon = function(stackedIcon) {
            _.remove($scope.stackedIcons, function(icon) {
                return icon.name == stackedIcon.name;
            });

            $scope.selectedStackedIcon = null;
        };
        $scope.newStackedIcon = function(name) {
            if (_.where($scope.stackedIcons, {
                name: name
            }).length == 0)
                $scope.stackedIcons.push({
                    name: name,
                    layers: []
                });
            else
                return 'An icon with this name already exists.';
        };
        $scope.getStackedIcon = function(layers) {
            if (typeof layers == 'object' && layers.length > 0) {
                var container, layer, span;
                container = $('<span></span>').addClass('fa-stack');
                for (var i in layers) {
                    layer = layers[i];
                    if (layer.icon) {
                        span = $('<span></span>');
                        span.addClass('fa');
                        span.addClass(layer.icon);
                        span.addClass('fa-stack-' + i)
                        container.append(span);
                    }
                }
                return container.html();
            }
            return "No layers found for stacked icon.";
        };
        $scope.setSelectedIcon = function(icon) {
            $scope.selectedIcon = icon;
            $('#iconTabs').on('toggled', function(event, tab) {
                $('#sliderR').foundation('slider', 'reflow');
                $('#iconTabs').unbind('toggled');
            });
        };
        $scope.updateSlider = function(color) {
            switch (color) {
                case 'r':
                    if (!$scope.iconOptions.color.r)
                        $scope.iconOptions.color.r = 0;
                    $('#sliderR').foundation('slider', 'set_value', $scope.iconOptions.color.r);
                    break;
                case 'g':
                    if (!$scope.iconOptions.color.g)
                        $scope.iconOptions.color.g = 0;
                    $('#sliderG').foundation('slider', 'set_value', $scope.iconOptions.color.g);
                    break;
                case 'b':
                    if (!$scope.iconOptions.color.b)
                        $scope.iconOptions.color.b = 0;
                    $('#sliderB').foundation('slider', 'set_value', $scope.iconOptions.color.b);
                    break;
                default:
                    break;
            }
        }
        $scope.getIconClass = function() {
            var c = ['fa'];
            if ($scope.selectedIcon) {
                c.push($scope.selectedIcon.icon);
                c.push('fa-' + $scope.iconOptions.size);
                c.push($scope.iconOptions.spin ? 'fa-spin' : '');
                c.push($scope.iconOptions.inverse ? 'fa-inverse' : '');
                c.push($scope.iconOptions.border ? 'fa-border' : '');
                if ($scope.iconOptions.flip_vert)
                    c.push('fa-flip-vertical');
                else if ($scope.iconOptions.flip_horiz)
                    c.push('fa-flip-horizontal');
                else
                    c.push($scope.iconOptions.rotation != '0' ? 'fa-rotate-' + $scope.iconOptions.rotation : undefined);
            }
            return c.filter(function(n) {
                return n != '';
            }).join(' ');
        };

        $(document).foundation({
            slider: {
                on_change: function() {
                    var r = parseInt($('#sliderR').attr('data-slider'));
                    var g = parseInt($('#sliderG').attr('data-slider'));
                    var b = parseInt($('#sliderB').attr('data-slider'));
                    if (!$scope.$$phase) {
                        $scope.$apply(function() {
                            $scope.iconOptions.color.r = r;
                            $scope.iconOptions.color.g = g;
                            $scope.iconOptions.color.b = b;
                            r = ("00" + r.toString(16)).slice(-2);
                            g = ("00" + g.toString(16)).slice(-2);
                            b = ("00" + b.toString(16)).slice(-2);
                            $scope.iconOptions.color.hex = '#' + r + g + b;
                        });
                    }
                }
            }
        });

        $('#formNewIcon').on('valid.fndtn.abide', function() {
            var name = $('#textBoxNewIconName').val();
            $('#formNewIcon')[0].reset();
            var msgs = $scope.newStackedIcon(name);
            $('#newStackedIconModal').foundation('reveal', 'close');

            if (msgs)
                alertError(msgs, 5);
            else
                alertSuccess('Added new stacked icon: ' + name, 5);
        });

        if (!debug) {
            $http.get('./data/fa.json').then(function(res) {
                //$scope.message = 'Loaded icons...';
                $scope.loading = false;
                $scope.icons = res.data;
            });
        } else {
            $scope.loading = false;
            $scope.icons = [{
                "icon": "fa-adjust",
                "unicode": "f042"
            }, {
                "icon": "fa-adn",
                "unicode": "f170"
            }, {
                "icon": "fa-align-center",
                "unicode": "f037"
            }, {
                "icon": "fa-align-justify",
                "unicode": "f039"
            }, {
                "icon": "fa-align-left",
                "unicode": "f036"
            }, {
                "icon": "fa-align-right",
                "unicode": "f038"
            }, {
                "icon": "fa-ambulance",
                "unicode": "f0f9"
            }, {
                "icon": "fa-anchor",
                "unicode": "f13d"
            }, {
                "icon": "fa-android",
                "unicode": "f17b"
            }, {
                "icon": "fa-angle-double-down",
                "unicode": "f103"
            }, {
                "icon": "fa-angle-double-left",
                "unicode": "f100"
            }, {
                "icon": "fa-angle-double-right",
                "unicode": "f101"
            }, {
                "icon": "fa-angle-double-up",
                "unicode": "f102"
            }, {
                "icon": "fa-angle-down",
                "unicode": "f107"
            }, {
                "icon": "fa-angle-left",
                "unicode": "f104"
            }, {
                "icon": "fa-angle-right",
                "unicode": "f105"
            }, {
                "icon": "fa-angle-up",
                "unicode": "f106"
            }, {
                "icon": "fa-apple",
                "unicode": "f179"
            }, {
                "icon": "fa-archive",
                "unicode": "f187"
            }, {
                "icon": "fa-arrow-circle-down",
                "unicode": "f0ab"
            }, {
                "icon": "fa-arrow-circle-left",
                "unicode": "f0a8"
            }, {
                "icon": "fa-arrow-circle-o-down",
                "unicode": "f01a"
            }, {
                "icon": "fa-arrow-circle-o-left",
                "unicode": "f190"
            }, {
                "icon": "fa-arrow-circle-o-right",
                "unicode": "f18e"
            }, {
                "icon": "fa-arrow-circle-o-up",
                "unicode": "f01b"
            }, {
                "icon": "fa-arrow-circle-right",
                "unicode": "f0a9"
            }, {
                "icon": "fa-arrow-circle-up",
                "unicode": "f0aa"
            }, {
                "icon": "fa-arrow-down",
                "unicode": "f063"
            }, {
                "icon": "fa-arrow-left",
                "unicode": "f060"
            }, {
                "icon": "fa-arrow-right",
                "unicode": "f061"
            }, {
                "icon": "fa-arrow-up",
                "unicode": "f062"
            }, {
                "icon": "fa-arrows",
                "unicode": "f047"
            }, {
                "icon": "fa-arrows-alt",
                "unicode": "f0b2"
            }, {
                "icon": "fa-arrows-h",
                "unicode": "f07e"
            }, {
                "icon": "fa-arrows-v",
                "unicode": "f07d"
            }, {
                "icon": "fa-asterisk",
                "unicode": "f069"
            }, {
                "icon": "fa-automobile",
                "unicode": "f1b9"
            }, {
                "icon": "fa-backward",
                "unicode": "f04a"
            }, {
                "icon": "fa-ban",
                "unicode": "f05e"
            }, {
                "icon": "fa-bank",
                "unicode": "f19c"
            }, {
                "icon": "fa-bar-chart-o",
                "unicode": "f080"
            }, {
                "icon": "fa-barcode",
                "unicode": "f02a"
            }, {
                "icon": "fa-bars",
                "unicode": "f0c9"
            }, {
                "icon": "fa-beer",
                "unicode": "f0fc"
            }, {
                "icon": "fa-behance",
                "unicode": "f1b4"
            }, {
                "icon": "fa-behance-square",
                "unicode": "f1b5"
            }, {
                "icon": "fa-bell",
                "unicode": "f0f3"
            }, {
                "icon": "fa-bell-o",
                "unicode": "f0a2"
            }, {
                "icon": "fa-bitbucket",
                "unicode": "f171"
            }, {
                "icon": "fa-bitbucket-square",
                "unicode": "f172"
            }, {
                "icon": "fa-bitcoin",
                "unicode": "f15a"
            }, {
                "icon": "fa-bold",
                "unicode": "f032"
            }, {
                "icon": "fa-bolt",
                "unicode": "f0e7"
            }, {
                "icon": "fa-bomb",
                "unicode": "f1e2"
            }, {
                "icon": "fa-book",
                "unicode": "f02d"
            }, {
                "icon": "fa-bookmark",
                "unicode": "f02e"
            }, {
                "icon": "fa-bookmark-o",
                "unicode": "f097"
            }, {
                "icon": "fa-briefcase",
                "unicode": "f0b1"
            }, {
                "icon": "fa-btc",
                "unicode": "f15a"
            }, {
                "icon": "fa-bug",
                "unicode": "f188"
            }, {
                "icon": "fa-building",
                "unicode": "f1ad"
            }, {
                "icon": "fa-building-o",
                "unicode": "f0f7"
            }, {
                "icon": "fa-bullhorn",
                "unicode": "f0a1"
            }, {
                "icon": "fa-bullseye",
                "unicode": "f140"
            }, {
                "icon": "fa-cab",
                "unicode": "f1ba"
            }, {
                "icon": "fa-calendar",
                "unicode": "f073"
            }, {
                "icon": "fa-calendar-o",
                "unicode": "f133"
            }, {
                "icon": "fa-camera",
                "unicode": "f030"
            }, {
                "icon": "fa-camera-retro",
                "unicode": "f083"
            }, {
                "icon": "fa-car",
                "unicode": "f1b9"
            }, {
                "icon": "fa-caret-down",
                "unicode": "f0d7"
            }, {
                "icon": "fa-caret-left",
                "unicode": "f0d9"
            }, {
                "icon": "fa-caret-right",
                "unicode": "f0da"
            }, {
                "icon": "fa-caret-square-o-down",
                "unicode": "f150"
            }, {
                "icon": "fa-caret-square-o-left",
                "unicode": "f191"
            }, {
                "icon": "fa-caret-square-o-right",
                "unicode": "f152"
            }, {
                "icon": "fa-caret-square-o-up",
                "unicode": "f151"
            }, {
                "icon": "fa-caret-up",
                "unicode": "f0d8"
            }, {
                "icon": "fa-certificate",
                "unicode": "f0a3"
            }, {
                "icon": "fa-chain",
                "unicode": "f0c1"
            }, {
                "icon": "fa-chain-broken",
                "unicode": "f127"
            }, {
                "icon": "fa-check",
                "unicode": "f00c"
            }, {
                "icon": "fa-check-circle",
                "unicode": "f058"
            }, {
                "icon": "fa-check-circle-o",
                "unicode": "f05d"
            }, {
                "icon": "fa-check-square",
                "unicode": "f14a"
            }, {
                "icon": "fa-check-square-o",
                "unicode": "f046"
            }, {
                "icon": "fa-chevron-circle-down",
                "unicode": "f13a"
            }, {
                "icon": "fa-chevron-circle-left",
                "unicode": "f137"
            }, {
                "icon": "fa-chevron-circle-right",
                "unicode": "f138"
            }, {
                "icon": "fa-chevron-circle-up",
                "unicode": "f139"
            }, {
                "icon": "fa-chevron-down",
                "unicode": "f078"
            }, {
                "icon": "fa-chevron-left",
                "unicode": "f053"
            }, {
                "icon": "fa-chevron-right",
                "unicode": "f054"
            }, {
                "icon": "fa-chevron-up",
                "unicode": "f077"
            }, {
                "icon": "fa-child",
                "unicode": "f1ae"
            }, {
                "icon": "fa-circle",
                "unicode": "f111"
            }, {
                "icon": "fa-circle-o",
                "unicode": "f10c"
            }, {
                "icon": "fa-circle-o-notch",
                "unicode": "f1ce"
            }, {
                "icon": "fa-circle-thin",
                "unicode": "f1db"
            }, {
                "icon": "fa-clipboard",
                "unicode": "f0ea"
            }, {
                "icon": "fa-clock-o",
                "unicode": "f017"
            }, {
                "icon": "fa-cloud",
                "unicode": "f0c2"
            }, {
                "icon": "fa-cloud-download",
                "unicode": "f0ed"
            }, {
                "icon": "fa-cloud-upload",
                "unicode": "f0ee"
            }, {
                "icon": "fa-cny",
                "unicode": "f157"
            }, {
                "icon": "fa-code",
                "unicode": "f121"
            }, {
                "icon": "fa-code-fork",
                "unicode": "f126"
            }, {
                "icon": "fa-codepen",
                "unicode": "f1cb"
            }, {
                "icon": "fa-coffee",
                "unicode": "f0f4"
            }, {
                "icon": "fa-cog",
                "unicode": "f013"
            }, {
                "icon": "fa-cogs",
                "unicode": "f085"
            }, {
                "icon": "fa-columns",
                "unicode": "f0db"
            }, {
                "icon": "fa-comment",
                "unicode": "f075"
            }, {
                "icon": "fa-comment-o",
                "unicode": "f0e5"
            }, {
                "icon": "fa-comments",
                "unicode": "f086"
            }, {
                "icon": "fa-comments-o",
                "unicode": "f0e6"
            }, {
                "icon": "fa-compass",
                "unicode": "f14e"
            }, {
                "icon": "fa-compress",
                "unicode": "f066"
            }, {
                "icon": "fa-copy",
                "unicode": "f0c5"
            }, {
                "icon": "fa-credit-card",
                "unicode": "f09d"
            }, {
                "icon": "fa-crop",
                "unicode": "f125"
            }, {
                "icon": "fa-crosshairs",
                "unicode": "f05b"
            }, {
                "icon": "fa-css3",
                "unicode": "f13c"
            }, {
                "icon": "fa-cube",
                "unicode": "f1b2"
            }, {
                "icon": "fa-cubes",
                "unicode": "f1b3"
            }, {
                "icon": "fa-cut",
                "unicode": "f0c4"
            }, {
                "icon": "fa-cutlery",
                "unicode": "f0f5"
            }, {
                "icon": "fa-dashboard",
                "unicode": "f0e4"
            }, {
                "icon": "fa-database",
                "unicode": "f1c0"
            }, {
                "icon": "fa-dedent",
                "unicode": "f03b"
            }, {
                "icon": "fa-delicious",
                "unicode": "f1a5"
            }, {
                "icon": "fa-desktop",
                "unicode": "f108"
            }, {
                "icon": "fa-deviantart",
                "unicode": "f1bd"
            }, {
                "icon": "fa-digg",
                "unicode": "f1a6"
            }, {
                "icon": "fa-dollar",
                "unicode": "f155"
            }, {
                "icon": "fa-dot-circle-o",
                "unicode": "f192"
            }, {
                "icon": "fa-download",
                "unicode": "f019"
            }, {
                "icon": "fa-dribbble",
                "unicode": "f17d"
            }, {
                "icon": "fa-dropbox",
                "unicode": "f16b"
            }, {
                "icon": "fa-drupal",
                "unicode": "f1a9"
            }, {
                "icon": "fa-edit",
                "unicode": "f044"
            }, {
                "icon": "fa-eject",
                "unicode": "f052"
            }, {
                "icon": "fa-ellipsis-h",
                "unicode": "f141"
            }, {
                "icon": "fa-ellipsis-v",
                "unicode": "f142"
            }, {
                "icon": "fa-empire",
                "unicode": "f1d1"
            }, {
                "icon": "fa-envelope",
                "unicode": "f0e0"
            }, {
                "icon": "fa-envelope-o",
                "unicode": "f003"
            }, {
                "icon": "fa-envelope-square",
                "unicode": "f199"
            }, {
                "icon": "fa-eraser",
                "unicode": "f12d"
            }, {
                "icon": "fa-eur",
                "unicode": "f153"
            }, {
                "icon": "fa-euro",
                "unicode": "f153"
            }, {
                "icon": "fa-exchange",
                "unicode": "f0ec"
            }, {
                "icon": "fa-exclamation",
                "unicode": "f12a"
            }, {
                "icon": "fa-exclamation-circle",
                "unicode": "f06a"
            }, {
                "icon": "fa-exclamation-triangle",
                "unicode": "f071"
            }, {
                "icon": "fa-expand",
                "unicode": "f065"
            }, {
                "icon": "fa-external-link",
                "unicode": "f08e"
            }, {
                "icon": "fa-external-link-square",
                "unicode": "f14c"
            }, {
                "icon": "fa-eye",
                "unicode": "f06e"
            }, {
                "icon": "fa-eye-slash",
                "unicode": "f070"
            }, {
                "icon": "fa-facebook",
                "unicode": "f09a"
            }, {
                "icon": "fa-facebook-square",
                "unicode": "f082"
            }, {
                "icon": "fa-fast-backward",
                "unicode": "f049"
            }, {
                "icon": "fa-fast-forward",
                "unicode": "f050"
            }, {
                "icon": "fa-fax",
                "unicode": "f1ac"
            }, {
                "icon": "fa-female",
                "unicode": "f182"
            }, {
                "icon": "fa-fighter-jet",
                "unicode": "f0fb"
            }, {
                "icon": "fa-file",
                "unicode": "f15b"
            }, {
                "icon": "fa-file-archive-o",
                "unicode": "f1c6"
            }, {
                "icon": "fa-file-audio-o",
                "unicode": "f1c7"
            }, {
                "icon": "fa-file-code-o",
                "unicode": "f1c9"
            }, {
                "icon": "fa-file-excel-o",
                "unicode": "f1c3"
            }, {
                "icon": "fa-file-image-o",
                "unicode": "f1c5"
            }, {
                "icon": "fa-file-movie-o",
                "unicode": "f1c8"
            }, {
                "icon": "fa-file-o",
                "unicode": "f016"
            }, {
                "icon": "fa-file-pdf-o",
                "unicode": "f1c1"
            }, {
                "icon": "fa-file-photo-o",
                "unicode": "f1c5"
            }, {
                "icon": "fa-file-picture-o",
                "unicode": "f1c5"
            }, {
                "icon": "fa-file-powerpoint-o",
                "unicode": "f1c4"
            }, {
                "icon": "fa-file-sound-o",
                "unicode": "f1c7"
            }, {
                "icon": "fa-file-text",
                "unicode": "f15c"
            }, {
                "icon": "fa-file-text-o",
                "unicode": "f0f6"
            }, {
                "icon": "fa-file-video-o",
                "unicode": "f1c8"
            }, {
                "icon": "fa-file-word-o",
                "unicode": "f1c2"
            }, {
                "icon": "fa-file-zip-o",
                "unicode": "f1c6"
            }, {
                "icon": "fa-files-o",
                "unicode": "f0c5"
            }, {
                "icon": "fa-film",
                "unicode": "f008"
            }, {
                "icon": "fa-filter",
                "unicode": "f0b0"
            }, {
                "icon": "fa-fire",
                "unicode": "f06d"
            }, {
                "icon": "fa-fire-extinguisher",
                "unicode": "f134"
            }, {
                "icon": "fa-flag",
                "unicode": "f024"
            }, {
                "icon": "fa-flag-checkered",
                "unicode": "f11e"
            }, {
                "icon": "fa-flag-o",
                "unicode": "f11d"
            }, {
                "icon": "fa-flash",
                "unicode": "f0e7"
            }, {
                "icon": "fa-flask",
                "unicode": "f0c3"
            }, {
                "icon": "fa-flickr",
                "unicode": "f16e"
            }, {
                "icon": "fa-floppy-o",
                "unicode": "f0c7"
            }, {
                "icon": "fa-folder",
                "unicode": "f07b"
            }, {
                "icon": "fa-folder-o",
                "unicode": "f114"
            }, {
                "icon": "fa-folder-open",
                "unicode": "f07c"
            }, {
                "icon": "fa-folder-open-o",
                "unicode": "f115"
            }, {
                "icon": "fa-font",
                "unicode": "f031"
            }, {
                "icon": "fa-forward",
                "unicode": "f04e"
            }, {
                "icon": "fa-foursquare",
                "unicode": "f180"
            }, {
                "icon": "fa-frown-o",
                "unicode": "f119"
            }, {
                "icon": "fa-gamepad",
                "unicode": "f11b"
            }, {
                "icon": "fa-gavel",
                "unicode": "f0e3"
            }, {
                "icon": "fa-gbp",
                "unicode": "f154"
            }, {
                "icon": "fa-ge",
                "unicode": "f1d1"
            }, {
                "icon": "fa-gear",
                "unicode": "f013"
            }, {
                "icon": "fa-gears",
                "unicode": "f085"
            }, {
                "icon": "fa-gift",
                "unicode": "f06b"
            }, {
                "icon": "fa-git",
                "unicode": "f1d3"
            }, {
                "icon": "fa-git-square",
                "unicode": "f1d2"
            }, {
                "icon": "fa-github",
                "unicode": "f09b"
            }, {
                "icon": "fa-github-alt",
                "unicode": "f113"
            }, {
                "icon": "fa-github-square",
                "unicode": "f092"
            }, {
                "icon": "fa-gittip",
                "unicode": "f184"
            }, {
                "icon": "fa-glass",
                "unicode": "f000"
            }, {
                "icon": "fa-globe",
                "unicode": "f0ac"
            }, {
                "icon": "fa-google",
                "unicode": "f1a0"
            }, {
                "icon": "fa-google-plus",
                "unicode": "f0d5"
            }, {
                "icon": "fa-google-plus-square",
                "unicode": "f0d4"
            }, {
                "icon": "fa-graduation-cap",
                "unicode": "f19d"
            }, {
                "icon": "fa-group",
                "unicode": "f0c0"
            }, {
                "icon": "fa-h-square",
                "unicode": "f0fd"
            }, {
                "icon": "fa-hacker-news",
                "unicode": "f1d4"
            }, {
                "icon": "fa-hand-o-down",
                "unicode": "f0a7"
            }, {
                "icon": "fa-hand-o-left",
                "unicode": "f0a5"
            }, {
                "icon": "fa-hand-o-right",
                "unicode": "f0a4"
            }, {
                "icon": "fa-hand-o-up",
                "unicode": "f0a6"
            }, {
                "icon": "fa-hdd-o",
                "unicode": "f0a0"
            }, {
                "icon": "fa-header",
                "unicode": "f1dc"
            }, {
                "icon": "fa-headphones",
                "unicode": "f025"
            }, {
                "icon": "fa-heart",
                "unicode": "f004"
            }, {
                "icon": "fa-heart-o",
                "unicode": "f08a"
            }, {
                "icon": "fa-history",
                "unicode": "f1da"
            }, {
                "icon": "fa-home",
                "unicode": "f015"
            }, {
                "icon": "fa-hospital-o",
                "unicode": "f0f8"
            }, {
                "icon": "fa-html5",
                "unicode": "f13b"
            }, {
                "icon": "fa-image",
                "unicode": "f03e"
            }, {
                "icon": "fa-inbox",
                "unicode": "f01c"
            }, {
                "icon": "fa-indent",
                "unicode": "f03c"
            }, {
                "icon": "fa-info",
                "unicode": "f129"
            }, {
                "icon": "fa-info-circle",
                "unicode": "f05a"
            }, {
                "icon": "fa-inr",
                "unicode": "f156"
            }, {
                "icon": "fa-instagram",
                "unicode": "f16d"
            }, {
                "icon": "fa-institution",
                "unicode": "f19c"
            }, {
                "icon": "fa-italic",
                "unicode": "f033"
            }, {
                "icon": "fa-joomla",
                "unicode": "f1aa"
            }, {
                "icon": "fa-jpy",
                "unicode": "f157"
            }, {
                "icon": "fa-jsfiddle",
                "unicode": "f1cc"
            }, {
                "icon": "fa-key",
                "unicode": "f084"
            }, {
                "icon": "fa-keyboard-o",
                "unicode": "f11c"
            }, {
                "icon": "fa-krw",
                "unicode": "f159"
            }, {
                "icon": "fa-language",
                "unicode": "f1ab"
            }, {
                "icon": "fa-laptop",
                "unicode": "f109"
            }, {
                "icon": "fa-leaf",
                "unicode": "f06c"
            }, {
                "icon": "fa-legal",
                "unicode": "f0e3"
            }, {
                "icon": "fa-lemon-o",
                "unicode": "f094"
            }, {
                "icon": "fa-level-down",
                "unicode": "f149"
            }, {
                "icon": "fa-level-up",
                "unicode": "f148"
            }, {
                "icon": "fa-life-bouy",
                "unicode": "f1cd"
            }, {
                "icon": "fa-life-ring",
                "unicode": "f1cd"
            }, {
                "icon": "fa-life-saver",
                "unicode": "f1cd"
            }, {
                "icon": "fa-lightbulb-o",
                "unicode": "f0eb"
            }, {
                "icon": "fa-link",
                "unicode": "f0c1"
            }, {
                "icon": "fa-linkedin",
                "unicode": "f0e1"
            }, {
                "icon": "fa-linkedin-square",
                "unicode": "f08c"
            }, {
                "icon": "fa-linux",
                "unicode": "f17c"
            }, {
                "icon": "fa-list",
                "unicode": "f03a"
            }, {
                "icon": "fa-list-alt",
                "unicode": "f022"
            }, {
                "icon": "fa-list-ol",
                "unicode": "f0cb"
            }, {
                "icon": "fa-list-ul",
                "unicode": "f0ca"
            }, {
                "icon": "fa-location-arrow",
                "unicode": "f124"
            }, {
                "icon": "fa-lock",
                "unicode": "f023"
            }, {
                "icon": "fa-long-arrow-down",
                "unicode": "f175"
            }, {
                "icon": "fa-long-arrow-left",
                "unicode": "f177"
            }, {
                "icon": "fa-long-arrow-right",
                "unicode": "f178"
            }, {
                "icon": "fa-long-arrow-up",
                "unicode": "f176"
            }, {
                "icon": "fa-magic",
                "unicode": "f0d0"
            }, {
                "icon": "fa-magnet",
                "unicode": "f076"
            }, {
                "icon": "fa-mail-forward",
                "unicode": "f064"
            }, {
                "icon": "fa-mail-reply",
                "unicode": "f112"
            }, {
                "icon": "fa-mail-reply-all",
                "unicode": "f122"
            }, {
                "icon": "fa-male",
                "unicode": "f183"
            }, {
                "icon": "fa-map-marker",
                "unicode": "f041"
            }, {
                "icon": "fa-maxcdn",
                "unicode": "f136"
            }, {
                "icon": "fa-medkit",
                "unicode": "f0fa"
            }, {
                "icon": "fa-meh-o",
                "unicode": "f11a"
            }, {
                "icon": "fa-microphone",
                "unicode": "f130"
            }, {
                "icon": "fa-microphone-slash",
                "unicode": "f131"
            }, {
                "icon": "fa-minus",
                "unicode": "f068"
            }, {
                "icon": "fa-minus-circle",
                "unicode": "f056"
            }, {
                "icon": "fa-minus-square",
                "unicode": "f146"
            }, {
                "icon": "fa-minus-square-o",
                "unicode": "f147"
            }, {
                "icon": "fa-mobile",
                "unicode": "f10b"
            }, {
                "icon": "fa-mobile-phone",
                "unicode": "f10b"
            }, {
                "icon": "fa-money",
                "unicode": "f0d6"
            }, {
                "icon": "fa-moon-o",
                "unicode": "f186"
            }, {
                "icon": "fa-mortar-board",
                "unicode": "f19d"
            }, {
                "icon": "fa-music",
                "unicode": "f001"
            }, {
                "icon": "fa-navicon",
                "unicode": "f0c9"
            }, {
                "icon": "fa-openid",
                "unicode": "f19b"
            }, {
                "icon": "fa-outdent",
                "unicode": "f03b"
            }, {
                "icon": "fa-pagelines",
                "unicode": "f18c"
            }, {
                "icon": "fa-paper-plane",
                "unicode": "f1d8"
            }, {
                "icon": "fa-paper-plane-o",
                "unicode": "f1d9"
            }, {
                "icon": "fa-paperclip",
                "unicode": "f0c6"
            }, {
                "icon": "fa-paragraph",
                "unicode": "f1dd"
            }, {
                "icon": "fa-paste",
                "unicode": "f0ea"
            }, {
                "icon": "fa-pause",
                "unicode": "f04c"
            }, {
                "icon": "fa-paw",
                "unicode": "f1b0"
            }, {
                "icon": "fa-pencil",
                "unicode": "f040"
            }, {
                "icon": "fa-pencil-square",
                "unicode": "f14b"
            }, {
                "icon": "fa-pencil-square-o",
                "unicode": "f044"
            }, {
                "icon": "fa-phone",
                "unicode": "f095"
            }, {
                "icon": "fa-phone-square",
                "unicode": "f098"
            }, {
                "icon": "fa-photo",
                "unicode": "f03e"
            }, {
                "icon": "fa-picture-o",
                "unicode": "f03e"
            }, {
                "icon": "fa-pied-piper",
                "unicode": "f1a7"
            }, {
                "icon": "fa-pied-piper-alt",
                "unicode": "f1a8"
            }, {
                "icon": "fa-pied-piper-square",
                "unicode": "f1a7"
            }, {
                "icon": "fa-pinterest",
                "unicode": "f0d2"
            }, {
                "icon": "fa-pinterest-square",
                "unicode": "f0d3"
            }, {
                "icon": "fa-plane",
                "unicode": "f072"
            }, {
                "icon": "fa-play",
                "unicode": "f04b"
            }, {
                "icon": "fa-play-circle",
                "unicode": "f144"
            }, {
                "icon": "fa-play-circle-o",
                "unicode": "f01d"
            }, {
                "icon": "fa-plus",
                "unicode": "f067"
            }, {
                "icon": "fa-plus-circle",
                "unicode": "f055"
            }, {
                "icon": "fa-plus-square",
                "unicode": "f0fe"
            }, {
                "icon": "fa-plus-square-o",
                "unicode": "f196"
            }, {
                "icon": "fa-power-off",
                "unicode": "f011"
            }, {
                "icon": "fa-print",
                "unicode": "f02f"
            }, {
                "icon": "fa-puzzle-piece",
                "unicode": "f12e"
            }, {
                "icon": "fa-qq",
                "unicode": "f1d6"
            }, {
                "icon": "fa-qrcode",
                "unicode": "f029"
            }, {
                "icon": "fa-question",
                "unicode": "f128"
            }, {
                "icon": "fa-question-circle",
                "unicode": "f059"
            }, {
                "icon": "fa-quote-left",
                "unicode": "f10d"
            }, {
                "icon": "fa-quote-right",
                "unicode": "f10e"
            }, {
                "icon": "fa-ra",
                "unicode": "f1d0"
            }, {
                "icon": "fa-random",
                "unicode": "f074"
            }, {
                "icon": "fa-rebel",
                "unicode": "f1d0"
            }, {
                "icon": "fa-recycle",
                "unicode": "f1b8"
            }, {
                "icon": "fa-reddit",
                "unicode": "f1a1"
            }, {
                "icon": "fa-reddit-square",
                "unicode": "f1a2"
            }, {
                "icon": "fa-refresh",
                "unicode": "f021"
            }, {
                "icon": "fa-renren",
                "unicode": "f18b"
            }, {
                "icon": "fa-reorder",
                "unicode": "f0c9"
            }, {
                "icon": "fa-repeat",
                "unicode": "f01e"
            }, {
                "icon": "fa-reply",
                "unicode": "f112"
            }, {
                "icon": "fa-reply-all",
                "unicode": "f122"
            }, {
                "icon": "fa-retweet",
                "unicode": "f079"
            }, {
                "icon": "fa-rmb",
                "unicode": "f157"
            }, {
                "icon": "fa-road",
                "unicode": "f018"
            }, {
                "icon": "fa-rocket",
                "unicode": "f135"
            }, {
                "icon": "fa-rotate-left",
                "unicode": "f0e2"
            }, {
                "icon": "fa-rotate-right",
                "unicode": "f01e"
            }, {
                "icon": "fa-rouble",
                "unicode": "f158"
            }, {
                "icon": "fa-rss",
                "unicode": "f09e"
            }, {
                "icon": "fa-rss-square",
                "unicode": "f143"
            }, {
                "icon": "fa-rub",
                "unicode": "f158"
            }, {
                "icon": "fa-ruble",
                "unicode": "f158"
            }, {
                "icon": "fa-rupee",
                "unicode": "f156"
            }, {
                "icon": "fa-save",
                "unicode": "f0c7"
            }, {
                "icon": "fa-scissors",
                "unicode": "f0c4"
            }, {
                "icon": "fa-search",
                "unicode": "f002"
            }, {
                "icon": "fa-search-minus",
                "unicode": "f010"
            }, {
                "icon": "fa-search-plus",
                "unicode": "f00e"
            }, {
                "icon": "fa-send",
                "unicode": "f1d8"
            }, {
                "icon": "fa-send-o",
                "unicode": "f1d9"
            }, {
                "icon": "fa-share",
                "unicode": "f064"
            }, {
                "icon": "fa-share-alt",
                "unicode": "f1e0"
            }, {
                "icon": "fa-share-alt-square",
                "unicode": "f1e1"
            }, {
                "icon": "fa-share-square",
                "unicode": "f14d"
            }, {
                "icon": "fa-share-square-o",
                "unicode": "f045"
            }, {
                "icon": "fa-shield",
                "unicode": "f132"
            }, {
                "icon": "fa-shopping-cart",
                "unicode": "f07a"
            }, {
                "icon": "fa-sign-in",
                "unicode": "f090"
            }, {
                "icon": "fa-sign-out",
                "unicode": "f08b"
            }, {
                "icon": "fa-signal",
                "unicode": "f012"
            }, {
                "icon": "fa-sitemap",
                "unicode": "f0e8"
            }, {
                "icon": "fa-skype",
                "unicode": "f17e"
            }, {
                "icon": "fa-slack",
                "unicode": "f198"
            }, {
                "icon": "fa-sliders",
                "unicode": "f1de"
            }, {
                "icon": "fa-smile-o",
                "unicode": "f118"
            }, {
                "icon": "fa-sort",
                "unicode": "f0dc"
            }, {
                "icon": "fa-sort-alpha-asc",
                "unicode": "f15d"
            }, {
                "icon": "fa-sort-alpha-desc",
                "unicode": "f15e"
            }, {
                "icon": "fa-sort-amount-asc",
                "unicode": "f160"
            }, {
                "icon": "fa-sort-amount-desc",
                "unicode": "f161"
            }, {
                "icon": "fa-sort-asc",
                "unicode": "f0de"
            }, {
                "icon": "fa-sort-desc",
                "unicode": "f0dd"
            }, {
                "icon": "fa-sort-down",
                "unicode": "f0dd"
            }, {
                "icon": "fa-sort-numeric-asc",
                "unicode": "f162"
            }, {
                "icon": "fa-sort-numeric-desc",
                "unicode": "f163"
            }, {
                "icon": "fa-sort-up",
                "unicode": "f0de"
            }, {
                "icon": "fa-soundcloud",
                "unicode": "f1be"
            }, {
                "icon": "fa-space-shuttle",
                "unicode": "f197"
            }, {
                "icon": "fa-spinner",
                "unicode": "f110"
            }, {
                "icon": "fa-spoon",
                "unicode": "f1b1"
            }, {
                "icon": "fa-spotify",
                "unicode": "f1bc"
            }, {
                "icon": "fa-square",
                "unicode": "f0c8"
            }, {
                "icon": "fa-square-o",
                "unicode": "f096"
            }, {
                "icon": "fa-stack-exchange",
                "unicode": "f18d"
            }, {
                "icon": "fa-stack-overflow",
                "unicode": "f16c"
            }, {
                "icon": "fa-star",
                "unicode": "f005"
            }, {
                "icon": "fa-star-half",
                "unicode": "f089"
            }, {
                "icon": "fa-star-half-empty",
                "unicode": "f123"
            }, {
                "icon": "fa-star-half-full",
                "unicode": "f123"
            }, {
                "icon": "fa-star-half-o",
                "unicode": "f123"
            }, {
                "icon": "fa-star-o",
                "unicode": "f006"
            }, {
                "icon": "fa-steam",
                "unicode": "f1b6"
            }, {
                "icon": "fa-steam-square",
                "unicode": "f1b7"
            }, {
                "icon": "fa-step-backward",
                "unicode": "f048"
            }, {
                "icon": "fa-step-forward",
                "unicode": "f051"
            }, {
                "icon": "fa-stethoscope",
                "unicode": "f0f1"
            }, {
                "icon": "fa-stop",
                "unicode": "f04d"
            }, {
                "icon": "fa-strikethrough",
                "unicode": "f0cc"
            }, {
                "icon": "fa-stumbleupon",
                "unicode": "f1a4"
            }, {
                "icon": "fa-stumbleupon-circle",
                "unicode": "f1a3"
            }, {
                "icon": "fa-subscript",
                "unicode": "f12c"
            }, {
                "icon": "fa-suitcase",
                "unicode": "f0f2"
            }, {
                "icon": "fa-sun-o",
                "unicode": "f185"
            }, {
                "icon": "fa-superscript",
                "unicode": "f12b"
            }, {
                "icon": "fa-support",
                "unicode": "f1cd"
            }, {
                "icon": "fa-table",
                "unicode": "f0ce"
            }, {
                "icon": "fa-tablet",
                "unicode": "f10a"
            }, {
                "icon": "fa-tachometer",
                "unicode": "f0e4"
            }, {
                "icon": "fa-tag",
                "unicode": "f02b"
            }, {
                "icon": "fa-tags",
                "unicode": "f02c"
            }, {
                "icon": "fa-tasks",
                "unicode": "f0ae"
            }, {
                "icon": "fa-taxi",
                "unicode": "f1ba"
            }, {
                "icon": "fa-tencent-weibo",
                "unicode": "f1d5"
            }, {
                "icon": "fa-terminal",
                "unicode": "f120"
            }, {
                "icon": "fa-text-height",
                "unicode": "f034"
            }, {
                "icon": "fa-text-width",
                "unicode": "f035"
            }, {
                "icon": "fa-th",
                "unicode": "f00a"
            }, {
                "icon": "fa-th-large",
                "unicode": "f009"
            }, {
                "icon": "fa-th-list",
                "unicode": "f00b"
            }, {
                "icon": "fa-thumb-tack",
                "unicode": "f08d"
            }, {
                "icon": "fa-thumbs-down",
                "unicode": "f165"
            }, {
                "icon": "fa-thumbs-o-down",
                "unicode": "f088"
            }, {
                "icon": "fa-thumbs-o-up",
                "unicode": "f087"
            }, {
                "icon": "fa-thumbs-up",
                "unicode": "f164"
            }, {
                "icon": "fa-ticket",
                "unicode": "f145"
            }, {
                "icon": "fa-times",
                "unicode": "f00d"
            }, {
                "icon": "fa-times-circle",
                "unicode": "f057"
            }, {
                "icon": "fa-times-circle-o",
                "unicode": "f05c"
            }, {
                "icon": "fa-tint",
                "unicode": "f043"
            }, {
                "icon": "fa-toggle-down",
                "unicode": "f150"
            }, {
                "icon": "fa-toggle-left",
                "unicode": "f191"
            }, {
                "icon": "fa-toggle-right",
                "unicode": "f152"
            }, {
                "icon": "fa-toggle-up",
                "unicode": "f151"
            }, {
                "icon": "fa-trash-o",
                "unicode": "f014"
            }, {
                "icon": "fa-tree",
                "unicode": "f1bb"
            }, {
                "icon": "fa-trello",
                "unicode": "f181"
            }, {
                "icon": "fa-trophy",
                "unicode": "f091"
            }, {
                "icon": "fa-truck",
                "unicode": "f0d1"
            }, {
                "icon": "fa-try",
                "unicode": "f195"
            }, {
                "icon": "fa-tumblr",
                "unicode": "f173"
            }, {
                "icon": "fa-tumblr-square",
                "unicode": "f174"
            }, {
                "icon": "fa-turkish-lira",
                "unicode": "f195"
            }, {
                "icon": "fa-twitter",
                "unicode": "f099"
            }, {
                "icon": "fa-twitter-square",
                "unicode": "f081"
            }, {
                "icon": "fa-umbrella",
                "unicode": "f0e9"
            }, {
                "icon": "fa-underline",
                "unicode": "f0cd"
            }, {
                "icon": "fa-undo",
                "unicode": "f0e2"
            }, {
                "icon": "fa-university",
                "unicode": "f19c"
            }, {
                "icon": "fa-unlink",
                "unicode": "f127"
            }, {
                "icon": "fa-unlock",
                "unicode": "f09c"
            }, {
                "icon": "fa-unlock-alt",
                "unicode": "f13e"
            }, {
                "icon": "fa-unsorted",
                "unicode": "f0dc"
            }, {
                "icon": "fa-upload",
                "unicode": "f093"
            }, {
                "icon": "fa-usd",
                "unicode": "f155"
            }, {
                "icon": "fa-user",
                "unicode": "f007"
            }, {
                "icon": "fa-user-md",
                "unicode": "f0f0"
            }, {
                "icon": "fa-users",
                "unicode": "f0c0"
            }, {
                "icon": "fa-video-camera",
                "unicode": "f03d"
            }, {
                "icon": "fa-vimeo-square",
                "unicode": "f194"
            }, {
                "icon": "fa-vine",
                "unicode": "f1ca"
            }, {
                "icon": "fa-vk",
                "unicode": "f189"
            }, {
                "icon": "fa-volume-down",
                "unicode": "f027"
            }, {
                "icon": "fa-volume-off",
                "unicode": "f026"
            }, {
                "icon": "fa-volume-up",
                "unicode": "f028"
            }, {
                "icon": "fa-warning",
                "unicode": "f071"
            }, {
                "icon": "fa-wechat",
                "unicode": "f1d7"
            }, {
                "icon": "fa-weibo",
                "unicode": "f18a"
            }, {
                "icon": "fa-weixin",
                "unicode": "f1d7"
            }, {
                "icon": "fa-wheelchair",
                "unicode": "f193"
            }, {
                "icon": "fa-windows",
                "unicode": "f17a"
            }, {
                "icon": "fa-won",
                "unicode": "f159"
            }, {
                "icon": "fa-wordpress",
                "unicode": "f19a"
            }, {
                "icon": "fa-wrench",
                "unicode": "f0ad"
            }, {
                "icon": "fa-xing",
                "unicode": "f168"
            }, {
                "icon": "fa-xing-square",
                "unicode": "f169"
            }, {
                "icon": "fa-yahoo",
                "unicode": "f19e"
            }, {
                "icon": "fa-yen",
                "unicode": "f157"
            }, {
                "icon": "fa-youtube",
                "unicode": "f167"
            }, {
                "icon": "fa-youtube-play",
                "unicode": "f16a"
            }, {
                "icon": "fa-youtube-square",
                "unicode": "f166"
            }];
        }
    }
]);

function alertMessage(message, delay) {
    alertBox(message, 'primary', delay);
}

function alertSuccess(message, delay) {
    alertBox(message, 'success', delay);
}

function alertInfo(message, delay) {
    return alertBox(message, 'info', delay);
}

function alertWarning(message, delay) {
    return alertBox(message, 'warning', delay);
}

function alertError(message, delay) {
    return alertBox(message, 'alert', delay);
}

function alertBox(message, type, delay) {
    alertCount++;
    var div = $('<div></div>');
    div.attr('id', 'alert' + alertCount);
    div.attr('data-alert', '');
    div.addClass('alert-box');
    if (type)
        div.addClass(type);
    div.text(message);
    var a = $('<a></a>');
    a.attr('href', '#');
    a.addClass('close');
    a.html('&times;');
    a.click(function() {
        div.fadeOut(1000, function() {
            div.remove();
        });
    })
    div.append(a);

    if (!alertContainer)
        alertContainer = $('div#alertContainer');

    alertContainer.append(div);

    if (delay) {
        var ms = parseInt(delay) * 1000;
        setTimeout(function() {
            div.fadeOut(1000, function() {
                div.remove();
            });
        }, ms);
    }

    return div;
}
