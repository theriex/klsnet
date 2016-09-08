/*global jtminjsDecorateWithUtilities, window */

/*jslint browser, multivar, white, fudge, for */

var app = {},
    jt = {};

(function () {
    "use strict";

    ////////////////////////////////////////
    // local variables
    ////////////////////////////////////////

    var addr = 
        ["k", "a", "r", "e", "n", ".", 
         "s", "u", "y", "e", "m", "o", "t", "o"],
        displayContent = "",


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
        idx = html.indexOf("<body");
        if(idx > 0) {
            html = html.slice(idx);
            idx = html.indexOf(">");
            html = html.slice(idx + 1, html.indexOf("</body")); }
        jt.out("contentdiv", html);
    },


    attachDocLinkClick = function (node, link) {
        var pes, src, fname, html;
        pes = link.split("/");
        if(pes.length >= 2) {
            src = pes[pes.length - 2];
            fname = pes[pes.length - 1];
            if(src === "html") {
                node.href = "index.html?sd=html&fn=" + fname; }
            else if(src == "pdf") {
                html = ["a", {href: "pdf/" + fname,
                              onclick: jt.fs("window.open('pdf/" + 
                                             fname + "')")},
                        node.innerHTML];
                node.outerHTML = jt.tac2html(html); } }
        if(link.indexOf(displayContent) > 0) {
            html = ["span", {cla: "currentContentLinkSpan"}, node.innerHTML];
            node.innerHTML = jt.tac2html(html); }
    },


    localDocLinks = function () {
        var i, nodes, node, href;
        nodes = document.getElementsByTagName("a");
        for(i = 0; nodes && i < nodes.length; i += 1) {
            node = nodes[i];
            href = node.href;
            //browser may resolve href relative path to absolute
            if(href && href.indexOf("index.html") < 0) {
                attachDocLinkClick(node, href); } }
    };


    //Sometimes there's a significant lag loading the fonts, and if
    //that happens the index page should not be waiting to display
    //because that just makes the whole site look slow. To avoid that
    //lag, load the fonts last.  If the fonts load fast, the update
    //will be imperceptible.  If they load slow then at least the
    //content will be available to read in the meantime.
    function addFontSupport () {
        var fontlink = document.createElement("link");
        fontlink.href = "http://fonts.googleapis.com/css?family=Asap";
        fontlink.rel = "stylesheet";
        fontlink.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(fontlink);
    }


    function initMenu () {
        var html, contentdiv;
        html = ["a", {href: "#menu", title: "Show Menu",
                      onclick: jt.fs("app.toggleMenu()")},
                [["img", {src: "img/bmenuico.png"}],
                 "menu"]];
        jt.out("menuaccessdiv", jt.tac2html(html));
        contentdiv = jt.byId("menucontentdiv");
        html = ["div", {id: "closemenuxdiv", 
                        style: "float:right;margin:5px;"},
                ["a", {href: "#closemenu", title: "Hide Menu",
                       onclick: jt.fs("app.toggleMenu()")},
                 "[x]"]];
        html = jt.tac2html(html) + contentdiv.innerHTML;
        contentdiv.innerHTML = html;
        contentdiv.style.display = "none";
    }


    ////////////////////////////////////////
    // application level functions
    ////////////////////////////////////////

    app.displayDoc = function (url) {
        var html = "Retrieving " + url + " ...";
        jt.out("contentdiv", html);
        if(url.indexOf(":") < 0) {
            url = relativeToAbsolute(url); }
        jt.request("GET", url, null,
                   function (resp) {
                       displayDocContent(url, resp); },
                   function (code, errtxt) {
                       displayDocContent(url, String(code) + ": " + errtxt); },
                   jt.semaphore("app.displayDoc"));
    };


    app.contact = function () {
        var span, html;
        span = jt.byId("clink");
        if(span) {
            html = span.innerHTML;
            html = ["a", {href: "mailto:" + addr.join("") + "@umb.edu"},
                    html];
            jt.out("clink", jt.tac2html(html)); }
    };


    app.init = function () {
        var pobj;
        jtminjsDecorateWithUtilities(jt);
        pobj = jt.paramsToObj(window.location.search, {}, "String");
        displayContent = "html/intro.html";
        if(pobj.sd && pobj.fn) {
            displayContent = pobj.sd + "/" + pobj.fn; }
        app.displayDoc(displayContent);
        initMenu();  //rewrites menu doc html
        localDocLinks();
        setTimeout(app.contact, 4000);
        addFontSupport();
    };


    app.toggleMenu = function () {
        var mcont, mico;
        mcont = jt.byId("menucontentdiv");
        if(mcont) {
            mico = jt.byId("menuaccessdiv");
            if(mcont.style.display === "block") {
                mico.style.display = "block";
                mcont.style.display = "none"; }
            else {
                mico.style.display = "none";
                mcont.style.display = "block"; }}
    };


} () );
