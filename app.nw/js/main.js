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