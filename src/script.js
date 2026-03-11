
window.onscroll = function() { scrollFunction() };
window.onload = function() { load() };

function scrollFunction() {
    var scrolled = document.body.scrollTop > 30 || document.documentElement.scrollTop > 30;
    var header = document.getElementById("header");
    var logo = document.getElementById("img_logo");
    var main = document.getElementById("main");

    if (scrolled) {
        header.style.height = "var(--header-height-compact)";
        logo.style.height = "50px";
    } else {
        header.style.height = "";
        logo.style.height = "";
    }
}

function onClick(item) {
    var box = document.getElementById(item.getAttribute('arg'));
    if (box.style.display == 'block') {
        box.style.display = 'none';
    } else {
        box.style.display = 'block';
    }
}

function load() {
    request_button("menu", 2);
    request_button("bebidas", 2);
    //2 para PT, 3 para EN
}

function request_item(item, text_column) {
    item.innerHTML = "";
    var url = 'https://docs.google.com/spreadsheets/d/';
    var ssid = '12DfFGnumxEpjz99TZq9CHpZBsPVULcH_KExm8-oI8ck';
    var q1 = '/gviz/tq?';
    var q2 = 'tqx=out:json';
    var q3 = 'sheet=items';
    var q = 'Select * WHERE B ="' + item.id + '"';
    var q4 = encodeURIComponent(q);

    var endpoint1 = url + ssid + q1 + '&' + q2 + '&' + q3 + '&tq=' + q4;

    fetch(endpoint1)
    .then(function(res) { return res.text(); })
    .then(function(data) {
        var temp = data.substring(47).slice(0, -2);
        var json = JSON.parse(temp);
        var rows = json.table.rows;

        rows.forEach(function(element) {
            if (element.c[0].v == true) {
                var new_row = document.createElement('div');
                var pd = document.createElement('div');
                var price = document.createElement('div');
                var product = document.createElement('div');
                var description = document.createElement('div');

                new_row.classList.add('row');
                pd.classList.add('column');
                price.classList.add('column');
                product.classList.add('product');
                description.classList.add('description');

                if (element.c[text_column] != null) {
                    product.textContent = element.c[text_column].v;
                } else {
                    product.textContent = "";
                }

                if (element.c[2] != null) {
                    price.textContent = "\u20AC " + element.c[2].v;
                } else {
                    price.textContent = "";
                }

                if (element.c[text_column + 1] != null) {
                    description.textContent = element.c[text_column + 1].v;
                } else {
                    description.textContent = "";
                }

                pd.append(product);
                pd.append(description);
                new_row.append(pd);
                new_row.append(price);

                item.append(new_row);
            }
        });
    });
}

function request_button(item, text_column) {
    var url = 'https://docs.google.com/spreadsheets/d/';
    var ssid = '12DfFGnumxEpjz99TZq9CHpZBsPVULcH_KExm8-oI8ck';
    var q1 = '/gviz/tq?';
    var q2 = 'tqx=out:json';
    var q3 = 'sheet=buttons';
    var q = 'Select * WHERE A ="' + item + '"';
    var q4 = encodeURIComponent(q);

    var endpoint1 = url + ssid + q1 + '&' + q2 + '&' + q3 + '&tq=' + q4;

    var menu_list = document.getElementById(item + "_list");
    var section = document.getElementById(item);
    menu_list.innerHTML = "";
    section.classList.add('loading');

    fetch(endpoint1)
    .then(function(res) { return res.text(); })
    .then(function(data) {
        section.classList.remove('loading');
        var temp = data.substring(47).slice(0, -2);
        var json = JSON.parse(temp);
        var rows = json.table.rows;

        rows.forEach(function(element, index) {
            var new_li = document.createElement('li');
            var button = document.createElement('div');
            var box = document.createElement('div');

            button.classList.add('main_button');
            button.setAttribute("arg", element.c[1].v);
            button.onclick = function() { onClick(this) };
            button.textContent = element.c[text_column].v;

            // Staggered animation
            new_li.style.opacity = '0';
            new_li.style.transform = 'translateY(12px)';
            new_li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            new_li.style.transitionDelay = (index * 0.06) + 's';

            box.id = element.c[1].v;
            box.classList.add('box_content');
            box.style.display = 'none';

            if (text_column == 2) {
                request_item(box, 3);
                document.getElementById("english").style.display = 'none';
                document.getElementById("portuguese").style.display = 'block';
            } else if (text_column == 3) {
                request_item(box, 5);
                document.getElementById("english").style.display = 'block';
                document.getElementById("portuguese").style.display = 'none';
            }

            new_li.append(button);
            new_li.append(box);
            menu_list.append(new_li);

            // Trigger staggered entrance
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    new_li.style.opacity = '1';
                    new_li.style.transform = 'translateY(0)';
                });
            });
        });
    });
}
