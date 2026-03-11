
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

function switchLang(col) {
    var loader = document.getElementById("page-loader");
    loader.classList.remove("hidden");
    Promise.all([
        request_button("menu", col),
        request_button("bebidas", col)
    ]).then(function() {
        loader.classList.add("hidden");
    });
}

function load() {
    Promise.all([
        request_button("menu", 2),
        request_button("bebidas", 2)
    ]).then(function() {
        document.getElementById("page-loader").classList.add("hidden");
    });
    //2 para PT, 3 para EN
}

function request_item(item, text_column) {
    var url = 'https://docs.google.com/spreadsheets/d/';
    var ssid = '12DfFGnumxEpjz99TZq9CHpZBsPVULcH_KExm8-oI8ck';
    var q1 = '/gviz/tq?';
    var q2 = 'tqx=out:json';
    var q3 = 'sheet=items';
    var q = 'Select * WHERE B ="' + item.id + '"';
    var q4 = encodeURIComponent(q);

    var endpoint1 = url + ssid + q1 + '&' + q2 + '&' + q3 + '&tq=' + q4;

    return fetch(endpoint1)
    .then(function(res) { return res.text(); })
    .then(function(data) {
        var temp = data.substring(47).slice(0, -2);
        var json = JSON.parse(temp);
        var rows = json.table.rows;

        item.innerHTML = '';
        var hasItems = false;

        rows.forEach(function(element) {
            if (element.c[0].v == true) {
                hasItems = true;
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

        if (!hasItems) {
            item.parentElement.style.display = 'none';
        }

        return hasItems;
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
    section.style.display = 'none';

    return fetch(endpoint1)
    .then(function(res) { return res.text(); })
    .then(function(data) {
        var temp = data.substring(47).slice(0, -2);
        var json = JSON.parse(temp);
        var rows = json.table.rows;

        if (!rows || rows.length === 0) {
            return;
        }

        section.classList.remove('loading');

        var itemPromises = [];

        rows.forEach(function(element, index) {
            var new_li = document.createElement('li');
            var button = document.createElement('div');
            var box = document.createElement('div');

            button.classList.add('main_button');
            button.setAttribute("arg", element.c[1].v);
            button.onclick = function() { onClick(this) };
            button.textContent = element.c[text_column].v;

            new_li.style.opacity = '0';

            box.id = element.c[1].v;
            box.classList.add('box_content');
            box.style.display = 'none';

            var itemCol = text_column == 2 ? 3 : 5;
            itemPromises.push(request_item(box, itemCol));

            if (text_column == 2) {
                document.getElementById("english").style.display = 'none';
                document.getElementById("portuguese").style.display = 'block';
            } else if (text_column == 3) {
                document.getElementById("english").style.display = 'block';
                document.getElementById("portuguese").style.display = 'none';
            }

            new_li.append(button);
            new_li.append(box);
            menu_list.append(new_li);
        });

        // Wait for all items to load, then show section if any have content
        return Promise.all(itemPromises).then(function(results) {
            var hasAnyContent = results.some(function(r) { return r; });
            if (hasAnyContent) {
                section.style.display = 'block';
                // Staggered entrance for visible items
                var visibleItems = menu_list.querySelectorAll('li');
                var delay = 0;
                visibleItems.forEach(function(li) {
                    if (li.style.display !== 'none') {
                        li.style.transform = 'translateY(12px)';
                        li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        li.style.transitionDelay = delay + 's';
                        delay += 0.06;
                        requestAnimationFrame(function() {
                            requestAnimationFrame(function() {
                                li.style.opacity = '1';
                                li.style.transform = 'translateY(0)';
                            });
                        });
                    }
                });
            }
        });
    });
}
