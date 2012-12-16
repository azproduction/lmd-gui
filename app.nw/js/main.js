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