$.ajaxSetup({
    async: false
});



var UIController = (function() {

    return {
        addToHtmlFlow: function(data) {

            var element, html, newHtml;

            element = document.querySelector('.plan_feature');
            document.querySelector('.plan_feature').innerHTML = "";

            console.log(data.length);

            for (var i = 0; i < data.length; i++) {
                html = '<div class="plan_features">Title : %title%</br>Votes : %upvotes%</br>Score : %score%</br>Comments number : %num_comments%</br>Created : %created%</br></div>'
                newHtml = html.replace('%title%', data[i].title);
                newHtml = newHtml.replace('%upvotes%', data[i].upvotes);
                newHtml = newHtml.replace('%score%', data[i].score);
                newHtml = newHtml.replace('%num_comments%', data[i].num_comments);
                newHtml = newHtml.replace('%created%', data[i].created);
                element.insertAdjacentHTML('beforeEnd', newHtml);

            }

        },
        getSelectedItem: function() {
            var element = document.getElementById("selectFirst");
            var selectedElement = element.options[element.selectedIndex].value;
            return selectedElement;
        }

    }
})();

var dataController = (function() {

    var json, dateFromJson;


    var Post = function(title, upvotes, score, num_comments, created) {
        this.title = title;
        this.upvotes = upvotes;
        this.score = score;
        this.num_comments = num_comments;
        this.created = created;
    }

    var BestVoteAndCommentsObject = function(title, score, date) {
        this.title = title;
        this.score = score;
        this.date = date;
    }

    var getDate = function(date) {
        dateFromJson = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

        return dateFromJson;

    }


    var sortByParameter = function(sortingParameter) {

        if (sortingParameter == "date") {
            data.posts.sort(function(a, b) {
                return (a.created - b.created);
            })
        } else {
            data.posts.sort(function(a, b) {
                return a[sortingParameter] - b[sortingParameter];
            })
        }

    }
    //converting unix time
    var convertUnixTime = function(unixTimes) {

        var date = new Date(unixTimes * 1000);

        return getDate(date)

    }

    //creating and returning best matching post
    var createObjectForSortingBestVoteAndComments = function() {
        var arrayBestStructure = [];

        data.posts.forEach(function(el) {
            arrayBestStructure.push(new BestVoteAndCommentsObject(el.title, el.upvotes + el.num_comments, el.created));
        })
        //sorting by score
        arrayBestStructure.sort(function(a, b) {
            return a.score - b.score;
        })
        //sorting by date
        arrayBestStructure.sort(function(a, b) {
            if (a.score == b.score) {
                return (a.created - b.created);
            }
        })
        // creating best object
        arrayBestStructure = arrayBestStructure[arrayBestStructure.length - 1];
        //return title of best scoring object(using title as unical id)
        return arrayBestStructure.title;


    }

    var data = {
        posts: [],
        count: 0
    }




    return {

        getJsonData: function() {
            $.getJSON("https://www.reddit.com/r/funny.json", function(data) {
                json = data;
            });
            return json;
        },
        addData: function() {
            for (var i = 0; i < json.data.children.length; i++) {
                data.posts.push(new Post(json.data.children[i].data.title, json.data.children[i].data.ups, json.data.children[i].data.score, json.data.children[i].data.num_comments, convertUnixTime(json.data.children[i].data.created_utc)))
                data.count++;
            }
        },
        getData: function() {
            return data.posts;
        },
        sortByParameter: function(parameter) {
            sortByParameter(parameter);
        },
        //returning best matching post
        getBestVotes: function() {

            return createObjectForSortingBestVoteAndComments();

        },
        getObjectByParameter: function(parameter) {
            var neededElement;
            data.posts.forEach(function(el) {
                if (parameter.localeCompare(el.title) === 0) {
                    neededElement = el;
                }
            })

            return neededElement;
        },


        getLast24hDatePost: function() {
            var datas = {
                posts: [],
            }

            data.posts.forEach(function(el) {


                var ts = Math.round(new Date().getTime() / 1000);
                var tsYesterday = ts - (24 * 3600);

                if (el.created.getTime() / 1000 > tsYesterday) {
                    datas.posts.push(el);
                }

            })

            return datas;
        },

        testing: function() {
            sortByParameter('num_comments');
            console.log(data);
        }
    }
})();

var mainController = (function(UICntrl, dataCntrl) {

    var launchEventListeners = function() {


        document.querySelector('.select').addEventListener('change', function() {
            dataCntrl.sortByParameter(UICntrl.getSelectedItem().toLowerCase());

            UICntrl.addToHtmlFlow(dataCntrl.getData());
        });

        document.querySelector('.showBestVotesButton').addEventListener('click', function() {
            var array = [];
            array.push(dataCntrl.getObjectByParameter(dataCntrl.getBestVotes()));

            UICntrl.addToHtmlFlow(array);

        })

        document.querySelector('.showLastHourPostsButton').addEventListener('click', function() {


            dataCntrl.getLast24hDatePost();
            console.log(dataCntrl.getLast24hDatePost());

            UICntrl.addToHtmlFlow(dataCntrl.getLast24hDatePost().posts);

        })

    }

    var programBuilding = function() {
        dataCntrl.getJsonData();
        dataCntrl.addData();
        UICntrl.addToHtmlFlow(dataCntrl.getData())

    }

    return {
        init: function() {
            programBuilding();
            launchEventListeners();
        }
    }
})(UIController, dataController);

mainController.init();
