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
var $ = require('$'),
    ProjectsCollection = require('ProjectsCollection'),
    BuildsCollection = require('BuildsCollection'),

    SidebarView = require('SidebarView');

$(function () {
    // Initialize the application view
    new SidebarView();
    //new LandingBoxView();
    //new ProjectsView();

    ProjectsCollection.fetch();
    BuildsCollection.fetch();
});
}),{
"$": "@jQuery",
"SidebarView": (function (require, exports, module) { /* wrapped by builder */
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    ProjectsCollection = require('ProjectsCollection'),
    BuildsCollection = require('BuildsCollection'),
    ProjectView = require('ProjectView');

var SidebarView = Backbone.View.extend({
    el: '.b-sidebar',

    // template: _.template( statsTemplate ),

    events: {
        'click .js-add-project':    'addProject',
        'click .js-remove-project':	'removeSelectedProject'
    },

    initialize: function () {
        this.$landingBox = this.$el.find('.b-landing-box');
        this.$projects = this.$el.find('.b-projects');

        ProjectsCollection.on('reset remove add destroy', this.updateVisibility, this);
        ProjectsCollection.on('add', this.addOne, this);
        ProjectsCollection.on('reset', this.addAll, this);
    },

    addProject: function () {
        var project = ProjectsCollection.create({
            name: Math.random() + '',
            location: Math.random() + '',
            order: ProjectsCollection.nextOrder()
        });

        _(2).times(function () {
            this.addBuildTo(project.id);
        }, this);
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

    removeSelectedProject: function () {
        console.log('removeSelectedProject');
    },

    updateVisibility: function () {
        this.$landingBox.toggleClass('i-hidden', !!ProjectsCollection.length);
        this.$projects.toggleClass('i-hidden', !ProjectsCollection.length);
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
    }
});

module.exports = SidebarView;

}),
"ProjectView": (function (require, exports, module) { /* wrapped by builder */
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
        if (build.get('projectId') !== this.model.id) return;

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
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    buildTemplate = require('BuildTemplate');

var BuildView = Backbone.View.extend({
    tagName: 'li',

    template: _.template(buildTemplate),

    events: {
        'click': 'focusBuild'
    },

    initialize: function () {
        this.$el.addClass('b-projects__list__item');
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    render: function () {
        var isCurrent = this.model.get('isCurrent');
        this.$el.toggleClass('b-projects__list__item_state_current', isCurrent);

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    focusBuild: function () {
        this.model.focus();
    }
});

module.exports =  BuildView;

}),
"ProjectModel": (function (require, exports, module) { /* wrapped by builder */
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

module.exports = builds;

}),
"ProjectTemplate": "<div class=\"b-projects__header\">\n    <span><%- name %></span>\n    <div class=\"b-projects__eject js-eject icon-eject\" title=\"Eject project\"></div>\n</div>\n<ul class=\"b-projects__list\"></ul>",
"BuildTemplate": "<span><%- name %></span>\n<div class=\"projects__list__item__services\">\n    <% if ( isBuilding ) { %><span class=\"icon-cw\"></span><% } %><% if ( isWatching ) { %><span class=\"icon-eye\"></span><% } %><% if ( isStats ) { %><span class=\"icon-chart-bar\"></span><% } %>\n</div>"
},{})