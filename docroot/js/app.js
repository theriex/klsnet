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
        displayContent = "";


    ////////////////////////////////////////
    // local helper functions
    ////////////////////////////////////////

    function relativeToAbsolute (url) {
        var loc = window.location.href;
        loc = loc.slice(0, loc.lastIndexOf("/") + 1);
        return loc + url;
    }


    function isExternalContentLink (href) {
        if(!href) {
            return false; }
        if(href.indexOf("http") === 0 &&
           href.indexOf("klsuyemoto.net") < 0 &&
           href.indexOf(":10080") < 0) {
            return true; }
        if(href.endsWith(".pdf")) {
            return true; }
        return false;
    }


    function modifyContentLinks () {
        var i, nodes, node, href, html;
        nodes = jt.byId("contentdiv").getElementsByTagName("a");
        for(i = 0; nodes && i < nodes.length; i += 1) {
            node = nodes[i];
            href = node.href;
            if(isExternalContentLink(href)) {
                html = ["a", {href: href,
                              onclick: jt.fs("window.open('" + href + "')")},
                        node.innerHTML];
                node.outerHTML = jt.tac2html(html); } }
    }


    function displayDocContent (url, html) {
        var idx;
        if(!html || !html.trim()) {
            html = url + " contains no text"; }
        idx = html.indexOf("<body");
        if(idx > 0) {
            html = html.slice(idx);
            idx = html.indexOf(">");
            html = html.slice(idx + 1, html.indexOf("</body")); }
        jt.out("contentdiv", html);
        modifyContentLinks();
    }


    function attachDocLinkClick (node, link) {
        var pes, src, fname, html;
        pes = link.split("/");
        if(pes.length >= 2) {
            src = pes[pes.length - 2];
            fname = pes[pes.length - 1];
            if(src === "html") {
                node.href = "index.html?sd=html&fn=" + fname; }
            else if(src === "pdf") {
                html = ["a", {href: "pdf/" + fname,
                              onclick: jt.fs("window.open('pdf/" + 
                                             fname + "')")},
                        node.innerHTML];
                node.outerHTML = jt.tac2html(html); } }
        if(link.indexOf(displayContent) > 0) {
            html = ["span", {cla: "currentContentLinkSpan"}, node.innerHTML];
            node.innerHTML = jt.tac2html(html); }
    }


    function localDocLinks () {
        var i, nodes, node, href;
        nodes = document.getElementsByTagName("a");
        for(i = 0; nodes && i < nodes.length; i += 1) {
            node = nodes[i];
            href = node.href;
            //browser may resolve href relative path to absolute
            if(href && href.indexOf("index.html") < 0) {
                attachDocLinkClick(node, href); } }
    }


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


    function makeMenuHeadingClickFunc (href) {
        var menuid = href.slice(href.lastIndexOf("#") + 1);
        return function (evt) {
            jt.evtend(evt);
            app.selectSubMenu(menuid); };
    }


    function activateSubMenus () {
        var mcd = jt.byId("menucontentdiv"),
            ul = mcd.children[1];  //0 is 'x' div...
        Array.prototype.forEach.call(ul.children, function (li) {
            var link = li.children[0];
            jt.on(link, "click", makeMenuHeadingClickFunc(link.href)); });
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
        activateSubMenus();
        contentdiv.style.display = "none";
    }


    function findMenuIdByDisplayedContent () {
        var menuid = "",
            fn = displayContent,
            mul = jt.byId("menucontentdiv").children[1];  //0 is 'x' div
        if(fn.indexOf("/") >= 0) {
            fn = fn.slice(fn.lastIndexOf("/") + 1); }
        Array.prototype.forEach.call(mul.children, function (li) {
            var id = li.children[0].href;
            if(id.indexOf("#") < 0) { //single link menu item
                if(id.indexOf(fn) >= 0) {
                    return id.slice(id.lastIndexOf("=") + 1, -5); } }
            else {
                var subul = li.children[1].children[0];
                id = id.slice(id.lastIndexOf("#") + 1);
                Array.prototype.forEach.call(subul.children, function (sli) {
                    var link = sli.children[0];
                    if(link.href.indexOf(fn) >= 0) {
                        menuid = id; } }); } });
        return menuid;
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
            else {  //show menu
                app.selectSubMenu();
                mico.style.display = "none";
                mcont.style.display = "block"; }}
    };


    app.selectSubMenu = function (menuid) {
        var mul = jt.byId("menucontentdiv").children[1];  //0 is 'x' div
        var mibdc = findMenuIdByDisplayedContent();
        menuid = menuid || mibdc;
        if(menuid.endsWith(".html")) {
            app.toggleMenu();
            return app.displayDoc(menuid); }
        Array.prototype.forEach.call(mul.children, function (li) {
            var id = li.children[0].href;
            var hi = id.lastIndexOf("#");
            if(hi >= 0) {
                id = id.slice(hi + 1);
                const menudiv = jt.byId(id + "menudiv");
                if(id === menuid) {
                    menudiv.style.display = "block"; }
                else {
                    menudiv.style.display = "none"; } } });
    };


}());
