app.directive('message', function() {
    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'js/directive/messageDirective/messageHTML.html',
        link: link
    };

    function link(scope, element, attrs) {
        scope.avatarImg = "https://api.adorable.io/avatars/40/" + scope.info.author + "@adorable.io.png";
    }

});