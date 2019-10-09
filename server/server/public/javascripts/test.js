//Attempt to append a new element to the canvas...
$(async function () {
    let templates = await $.ajax({
        type: "GET",
        url: "/html/templates.html"
    });
    $('body').append(templates); 

    var spellAttackSrc = document.getElementById("spell-attack").innerHTML;
    var spellAttackTemp = Handlebars.compile(spellAttackSrc);

    var cirtRollSrc = document.getElementById("critroll").innerHTML;
    var cirtRollTemp = Handlebars.compile(cirtRollSrc);

    var spellSrc = document.getElementById("spell").innerHTML;
    var spellTemp = Handlebars.compile(spellSrc);

    var rollSrc = document.getElementById("roll").innerHTML;
    var rollTemp = Handlebars.compile(rollSrc);

    var cfSrc = document.getElementById("cf").innerHTML;
    var cfTemp = Handlebars.compile(cfSrc);

    $('.btn-primary.c').click(function () {
        $('.content').append(spellAttackTemp);
    });

    $('.btn-primary.r').click(function () {
        $('.content').append(rollTemp);
    });

    $('.btn-primary.sp').off().click(function () {
        $('.content').append(spellTemp);
    });

    $('.btn-primary.cs').off().click(function () {
        $('.content').append(cirtRollTemp);
    });

    $('.btn-primary.cf').off().click(function () {
        $('.content').append(cfTemp);
    });
}); 