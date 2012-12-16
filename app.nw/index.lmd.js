(function (global, main, modules, modules_options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        
        
        
        
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            lmd_trigger('lmd-register:before-register', moduleName, module);
            // Predefine in case of recursive require
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === "function") {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         *
         * @important Do not rename it!
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         *
         * @important Do not rename it!
         */
        lmd_trigger = function (event, data, data2, data3) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](data, data2, data3) || result;
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
                }
            }
            return result || [data, data2, data3];
        },
        /**
         * LMD event register function
         *
         * @important Do not rename it!
         */
        lmd_on = function (event, callback) {
            if (!lmd_events[event]) {
                lmd_events[event] = [];
            }
            lmd_events[event].push(callback);
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        require = function (moduleName) {
            var module = modules[moduleName];

            lmd_trigger('lmd-require:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }
            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            global: global,
            modules: modules,
            modules_options: modules_options,

            eval: global_eval,
            register: register_module,
            require: require,
            initialized: initialized_modules,

            
            
            
            
            
            

            on: lmd_on,
            trigger: lmd_trigger,
            undefined: local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * This plugin enables shortcuts
 *
 * Flag "shortcuts"
 *
 * This plugin provides private "is_shortcut" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function is_shortcut(moduleName, moduleContent) {
    return !sb.initialized[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}

function rewrite_shortcut(moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        sb.trigger('shortcuts:before-resolve', moduleName, module);

        moduleName = module.replace('@', '');
        module = sb.modules[moduleName];
    }
    return [moduleName, module];
}

    /**
     * @event *:rewrite-shortcut request for shortcut rewrite
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('*:rewrite-shortcut', rewrite_shortcut);

    /**
     * @event *:rewrite-shortcut fires before stats plugin counts require same as *:rewrite-shortcut
     *        but without triggering shortcuts:before-resolve event
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('stats:before-require-count', function (moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        moduleName = module.replace('@', '');
        module = sb.modules[moduleName];

        return [moduleName, module];
    }
});

}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', "main", require)[1], output.exports, output);
})/*DO NOT ADD ; !*/(this,(function (require, exports, module) { /* wrapped by builder */
"use strict";
var $ = require('$'),
    ProjectsCollection = require('ProjectsCollection'),
    BuildsCollection = require('BuildsCollection'),

    AppView = require('AppView');

$(function () {
    // Initialize the application view
    new AppView();

    ProjectsCollection.fetch();
    BuildsCollection.fetch();
});
}),{
"$": "@jQuery",
"AppView": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    ProjectsCollection = require('ProjectsCollection'),
    BuildsCollection = require('BuildsCollection'),
    ProjectView = require('ProjectView'),
    BuildInfoView = require('BuildInfoView');

var AppView = Backbone.View.extend({
    el: '.b-layout',

    events: {
        'click .js-add-project':    'addProject',
        'click .js-remove-project':	'removeSelectedProject'
    },

    initialize: function () {
        this.$landingBox = this.$el.find('.b-landing-box');
        this.$projects = this.$el.find('.b-projects');
        this.$buildInfo = this.$el.find('.b-build-info');
        this.$buildInfo.empty();
        this.$gettingStarted = this.$el.find('.b-getting-started');

        this.renderedBuilds = {};

        ProjectsCollection.on('reset remove add', this.updateVisibility, this);
        ProjectsCollection.on('add', this.addOne, this);
        ProjectsCollection.on('reset', this.addAll, this);

        BuildsCollection.on('change:isCurrent', this.addBuildInfo, this);
        BuildsCollection.on('reset', function () {
            // looking for current build/last selected
            var currentBuild = BuildsCollection.where({isCurrent: true});
            if (currentBuild[0]) {
                this.addBuildInfo(BuildsCollection.get(currentBuild[0].id));
            }

            // if no active builds - show getting started
            this.toggleBuildInfo(!!currentBuild[0]);
        }, this);

        BuildsCollection.on('destroy', function (build) {
            if (build.get('isCurrent')) {
                this.toggleBuildInfo(false);
            }
        }, this);
    },

    addProject: function () {
        var project = ProjectsCollection.create({
            name: Math.random() + '',
            location: Math.random() + '/' + Math.random(),
            order: ProjectsCollection.nextOrder()
        });

        _(2).times(function () {
            this.addBuildTo(project.id);
        }, this);
    },

    removeSelectedProject: function () {
        console.log('removeSelectedProject');
    },

    addBuildTo: function (projectId) {
        var build = BuildsCollection.create({
            name: Math.random() + '',
            projectId: projectId,
            isWatching: Math.random() > 0.5,
            isBuilding: Math.random() > 0.5,
            isStats: Math.random() > 0.5
        });

        build.focus();
    },

    updateVisibility: function () {
        this.$landingBox.toggleClass('i-hidden', !!ProjectsCollection.length);
        this.$projects.toggleClass('i-hidden', !ProjectsCollection.length);

        this.toggleBuildInfo(!!ProjectsCollection.length);
    },

    addOne: function(project) {
        var view = new ProjectView({
            model: project
        });

        this.$projects.append(view.render().el);
    },

    addAll: function() {
        this.$projects.empty();
        ProjectsCollection.each(this.addOne, this);
    },

    addBuildInfo: function (build) {
        this.toggleBuildInfo(true);
        // if already rendered do not add twice
        if (this.renderedBuilds[build.id]) {
            return;
        }

        var view = new BuildInfoView({
            model: build
        });

        this.renderedBuilds[build.id] = true;
        this.$buildInfo.append(view.render().el);
    },

    toggleBuildInfo: function (isShow) {
        this.$buildInfo.toggleClass('i-hidden', !isShow);
        this.$gettingStarted.toggleClass('i-hidden', isShow);
    }
});

module.exports = AppView;

}),
"ProjectView": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    BuildsCollection = require('BuildsCollection'),
    projectTemplate = require('ProjectTemplate'),

    BuildView = require('BuildView');

var TodoView = Backbone.View.extend({
    tagName:  'div',

    template: _.template(projectTemplate),

    events: {
        'click .js-eject': 'removeProject'
    },

    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);

        BuildsCollection.on('reset', this.renderAllBuilds, this);
        BuildsCollection.on('add', this.renderOneBuild, this);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$builds = this.$el.find('.b-projects__list');
        return this;
    },

    renderOneBuild: function (build) {
        if (build.get('projectId') !== this.model.id) {
            return;
        }

        var view = new BuildView({
            model: build
        });

        this.$builds.append(view.render().el);
    },

    renderAllBuilds: function () {
        this.$builds.empty();

        BuildsCollection.each(this.renderOneBuild, this);
    },

    removeProject: function () {
        this.model.destroy();
    }
});

module.exports =  TodoView;

}),
"BuildView": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    buildTemplate = require('BuildTemplate');

var BuildView = Backbone.View.extend({
    tagName: 'li',
    className: 'b-projects__list__item',

    template: _.template(buildTemplate),

    events: {
        'click': 'focusBuild'
    },

    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);

        // TODO Move out of this View
        this.model.on('change:isBuilding', this.lmdRebuild, this);
        this.model.on('change:isWatching', this.lmdSetWatch, this);
        this.model.on('change:isStats', this.lmdSetStats, this);
    },

    render: function () {
        var isCurrent = this.model.get('isCurrent');
        this.$el.toggleClass('b-projects__list__item_state_current', isCurrent);

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    focusBuild: function () {
        this.model.focus();
    },

    // TODO Move out of this View
    lmdRebuild: function (build) {
        if (!build.get('isBuilding')) {
            return;
        }

        setTimeout(function () {
            build.save({
                isBuilding: false
            });
        }, 1000);
    },

    // TODO Move out of this View
    lmdSetWatch: function () {
        if (this.model.get('isWatching')) {
            this.lmdStartWatch();
        } else {
            this.lmdStopWatch();
        }
    },

    // TODO Move out of this View
    lmdStartWatch: function () {
        console.log('lmdStartWatch');
    },

    // TODO Move out of this View
    lmdStopWatch: function () {
        console.log('lmdStopWatch');
    },

    // TODO Move out of this View
    lmdSetStats: function (build) {
        if (this.model.get('isStats')) {
            this.lmdStartStats();
        } else {
            this.lmdStopStats();
        }
    },

    // TODO Move out of this View
    lmdStartStats: function () {
        console.log('lmdStartStats');
    },

    // TODO Move out of this View
    lmdStopStats: function () {
        console.log('lmdStopStats');
    }
});

module.exports =  BuildView;

}),
"BuildInfoView": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    buildInfoTemplate = require('BuildInfoTemplate'),
    ProjectsCollection = require('ProjectsCollection');

var BuildView = Backbone.View.extend({
    tagName: 'div',
    className: 'b-build-info__item',

    template: _.template(buildInfoTemplate),

    events: {
        'click .js-info':       'info',
        'click .js-rebuild':    'rebuild',
        'click .js-watch':      'toggleWatch',
        'click .js-server':     'toggleServer'
    },

    initialize: function () {
        this.model.on('change', this.updateState, this);
        this.model.on('destroy', this.remove, this);
    },

    render: function () {
        var data = this.model.toJSON();
        data.project = ProjectsCollection.get(this.model.get('projectId')).toJSON();
        this.$el.html(this.template(data));

        this.$rebuild = this.$el.find('.js-rebuild');
        this.$watch = this.$el.find('.js-watch');
        this.$server = this.$el.find('.js-server');

        this.updateState();
        return this;
    },

    updateState: function () {
        var isCurrent = this.model.get('isCurrent'),
            isWatching = this.model.get('isWatching'),
            isBuilding = this.model.get('isBuilding'),
            isStats = this.model.get('isStats');

        this.$el.toggleClass('i-hidden', !isCurrent);
        this.$watch.toggleClass('b-action-button_state_active', isWatching);
        this.$server.toggleClass('b-action-button_state_active', isStats);
        this.$rebuild.toggleClass('b-action-button_state_active', isBuilding);
    },

    info: function () {
        console.log(this.model.id, 'info');
    },

    rebuild: function () {
        var self = this,
            isBuilding = this.model.get('isBuilding');

        if (isBuilding) {
            return;
        }

        // mock rebuilding
        this.model.save({
            isBuilding: true
        });
    },

    toggleWatch: function () {
        var isWatching = this.model.get('isWatching');
        this.model.save({
            isWatching: !isWatching
        });
    },

    toggleServer: function () {
        var isStats = this.model.get('isStats');
        this.model.save({
            isStats: !isStats
        });
    }
});

module.exports =  BuildView;

}),
"ProjectModel": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var _ = require('_'),
    Backbone = require('Backbone');

var ProjectModel = Backbone.Model.extend({
    defaults: {
        name: ''
    },

    validate: function (attrs) {
        if (!attrs.location) {
            return "location should not be empty";
        }
    }
});

module.exports = ProjectModel;

}),
"BuildModel": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var _ = require('_'),
    Backbone = require('Backbone');

var BuildModel = Backbone.Model.extend({
    defaults: {
        name: '',
        projectId: null, // belongs to one project
        isWatching: false,
        isBuilding: false,
        isStats: false,
        isCurrent: false
    },

    validate: function (attrs) {
        if (!attrs.projectId) {
            return "projectId should be specified";
        }
    },

    focus: function () {
        var currentSelected = this.collection.where({isCurrent: true});
        _.each(currentSelected, function (build) {
            this.collection.get(build.id).blur();
        }, this);

        this.save({
            isCurrent: true
        });
    },

    blur: function () {
        this.save({
            isCurrent: false
        });
    }
});

module.exports = BuildModel;
}),
"ProjectsCollection": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var _ = require('_'),
    Backbone = require('Backbone'),
    ProjectModel = require('ProjectModel'),
    BuildsCollection = require('BuildsCollection');

var ProjectsCollection = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: ProjectModel,
    localStorage: new Backbone.LocalStorage('lmd-projects'),

    nextOrder: function () {
        if (!this.length) {
            return 1;
        }
        return this.last().get('order') + 1;
    },

    comparator: function (todo) {
        return todo.get('order');
    }
});

var projects = new ProjectsCollection();

projects.on('destroy', function (project) {
    BuildsCollection.destroyByProjectId(project.id);
});

module.exports = projects;

}),
"BuildsCollection": (function (require, exports, module) { /* wrapped by builder */
"use strict";
var _ = require('_'),
    Backbone = require('Backbone'),
    BuildModel = require('BuildModel');

var BuildsCollection = Backbone.Collection.extend({
    model: BuildModel,
    localStorage: new Backbone.LocalStorage('lmd-builds'),

    destroyByProjectId: function (projectId) {
        _.each(this.where({projectId: projectId}), function (build) {
            this.get(build.id).destroy();
        }, this);
    }
});

var builds = new BuildsCollection();

builds.on('reset', function () {
    // disable isRebuilding
    builds.each(function (build) {
        if (build.get('isBuilding')) {
            build.save({
                isBuilding: false
            });
        }
    });
});

module.exports = builds;

}),
"ProjectTemplate": "<div class=\"b-projects__header\">\n    <span><%- name %></span>\n    <div class=\"b-projects__eject js-eject icon-eject\" title=\"Eject project\"></div>\n</div>\n<ul class=\"b-projects__list\"></ul>",
"BuildTemplate": "<span><%- name %></span>\n<div class=\"projects__list__item__services\">\n    <% if ( isBuilding ) { %><span class=\"icon-cw\"></span><% } %><% if ( isWatching ) { %><span class=\"icon-eye\"></span><% } %><% if ( isStats ) { %><span class=\"icon-chart-bar\"></span><% } %>\n</div>",
"BuildInfoTemplate": "<div class=\"b-toolbar\">\n    <div class=\"b-toolbar__project-info\">\n        <div class=\"b-project-info\">\n            <div class=\"b-project-info__title\">\n                <a class=\"b-project-info__link\" href=\"#\"><%- name %></a>\n            </div>\n            <div class=\"b-project-info__location\">\n                <a class=\"b-project-info__link\" href=\"#\"><%- project.location %></a>\n            </div>\n        </div>\n    </div>\n    <div class=\"b-toolbar__actions\">\n        <div class=\"b-action-button js-info\">\n            <div class=\"b-action-button__icon icon-help-circled\"></div>\n            <div class=\"b-action-button__title\">Info</div>\n        </div>\n        <div class=\"b-action-button js-rebuild\">\n            <div class=\"b-action-button__icon icon-tools\"></div>\n            <div class=\"b-action-button__title\">Rebuild</div>\n        </div>\n        <div class=\"b-action-button js-watch b-action-button_state_active\">\n            <div class=\"b-action-button__icon icon-eye\"></div>\n            <div class=\"b-action-button__title\">Watch</div>\n        </div>\n        <div class=\"b-action-button js-server b-action-button_state_active\">\n            <div class=\"b-action-button__icon icon-chart-bar\"></div>\n            <div class=\"b-action-button__title\">Server</div>\n        </div>\n    </div>\n    <div class=\"b-navigate b-navigate_type_top\">\n        <div class=\"b-navigate__text\">Use these buttons to make your build rock!</div>\n        <img src=\"images/thin-arrow-up.svg\">\n    </div>\n</div>\n<div class=\"b-log\">\n    <div class=\"b-log__report\">\n        <div class=\"b-log__report__title\">lmd info</div>\n        <pre class=\"b-log__report__result\">\ninfo:\ninfo:    LMD Package `index` (.lmd/index.lmd.json)\ninfo:\ninfo:    Modules (1)\ninfo:\ninfo:    name depends type  lazy greedy coverage sandbox\ninfo:    main ✘       plain ✘    ✘      ✘        ✘\ninfo:\ninfo:    Module Paths, Depends and Features\ninfo:\ninfo:    main  <- /Users/azproduction/Documents/my/lmd-gui/app.nw/js/main.js\ninfo:\ninfo:    Flags\ninfo:\ninfo:    ie  ✘\ninfo:\ninfo:    Paths\ninfo:\ninfo:    root      /Users/azproduction/Documents/my/lmd-gui/app.nw/js\ninfo:    output    /Users/azproduction/Documents/my/lmd-gui/app.nw/index.lmd.js\ninfo:    www_root  ✘\ninfo:\n</pre>\n        <div class=\"b-log__report__title\">lmd info</div>\n        <pre class=\"b-log__report__result\">\ninfo:\ninfo:    LMD Package `index` (.lmd/index.lmd.json)\ninfo:\ninfo:    Modules (1)\ninfo:\ninfo:    name depends type  lazy greedy coverage sandbox\ninfo:    main ✘       plain ✘    ✘      ✘        ✘\ninfo:\ninfo:    Module Paths, Depends and Features\ninfo:\ninfo:    main  <- /Users/azproduction/Documents/my/lmd-gui/app.nw/js/main.js\ninfo:\ninfo:    Flags\ninfo:\ninfo:    ie  ✘\ninfo:\ninfo:    Paths\ninfo:\ninfo:    root      /Users/azproduction/Documents/my/lmd-gui/app.nw/js\ninfo:    output    /Users/azproduction/Documents/my/lmd-gui/app.nw/index.lmd.js\ninfo:    www_root  ✘\ninfo:\n</pre>\n    </div>\n</div>"
},{})