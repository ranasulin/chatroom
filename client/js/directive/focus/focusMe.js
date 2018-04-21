app.directive('focusMe', function($timeout) {
        return {
            scope: {
                trigger: '=focusMe'
            },
            link: function(scope, element) {
                // Focus if focusme is triggered
                scope.$watch('trigger', function(value) {
                    if(value === true) {
                        $timeout(function() {
                            element[0].focus();
                            scope.trigger = false;
                        });
                    }
                });
            }
        };
    });
