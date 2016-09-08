/*global alert: false, console: false, confirm: false, setTimeout: false, window: false, document: false, history: false, navigator: false, jtminjsDecorateWithUtilities: false */

/*jslint regexp: true, unparam: true, white: true, maxerr: 50, indent: 4 */

var app = {},
    jt = {};

(function () {
    "use strict";

    ////////////////////////////////////////
    // local variables
    ////////////////////////////////////////

    var addr = 
        ['k', 'a', 'r', 'e', 'n', '.', 's', 'u', 'y', 'e', 'm', 'o', 't', 'o'],


    ////////////////////////////////////////
    // local helper functions
    ////////////////////////////////////////

    relativeToAbsolute = function (url) {
        var loc = window.location.href;
        loc = loc.slice(0, loc.lastIndexOf("/") + 1);
        return loc + url;
    },


    displayDocContent = function (url, html) {
        var idx;
        if(!html || !html.trim()) {
            html = url + " contains no text"; }
        idx = html.indexOf("<body>");
        if(idx > 0) {
            html = html.slice(idx + "<body>".length,
                              html.indexOf("</body")); }
        jt.out('contentdiv', html);
    },


    attachDocLinkClick = function (node, link) {
        var pes = link.split("/");
        if(pes.length >= 2) {
            if(pes[pes.length - 2] === "KLSweb") {
                node.href = "index.html?site=" + pes[pes.length - 2] +
                    "&file=" + pes[pes.length - 1]; }
            else if(pes[pes.length - 2] === "AARTweb") {
                node.href = "AARTindex.html?site=" + pes[pes.length - 2] +
                    "&file=" + pes[pes.length - 1]; } }
    },


    localDocLinks = function () {
        var i, nodes, node, href;
        nodes = document.getElementsByTagName('a');
        for(i = 0; nodes && i < nodes.length; i += 1) {
            node = nodes[i];
            href = node.href;
            //href may have been resolved from relative to absolute...
            if(href && href.indexOf("index.html") < 0) {
                attachDocLinkClick(node, href); } }
    };


    ////////////////////////////////////////
    // application level functions
    ////////////////////////////////////////

    app.displayDoc = function (url) {
        var html = "Retrieving " + url + " ...";
        jt.out('contentdiv', html);
        if(url.indexOf(":") < 0) {
            url = relativeToAbsolute(url); }
        jt.request('GET', url, null,
                   function (resp) {
                       displayDocContent(url, resp); },
                   function (code, errtxt) {
                       displayDocContent(url, errtxt); },
                   jt.semaphore("app.displayDoc"));
    };


    app.contact = function () {
        var html = jt.byId('clink').innerHTML;
        html = ["a", {href: "mailto:" + addr.join("") + "@umb.edu"},
                html];
        jt.out('clink', jt.tac2html(html));
    };


    app.init = function () {
        var pobj;
        jtminjsDecorateWithUtilities(jt);
        pobj = jt.paramsToObj(window.location.search, {}, "String");
        if(pobj.site && pobj.file) {
            app.displayDoc(pobj.site + "/" + pobj.file); }
        localDocLinks();
        setTimeout(app.contact, 4000);
    };


} () );
