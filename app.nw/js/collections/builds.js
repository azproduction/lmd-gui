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
