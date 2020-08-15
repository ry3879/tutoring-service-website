function create_post(id, username, date, title, details,likes, liked){
    var post = document.createElement("div");
    post.setAttribute("id", id);
    post.setAttribute("class", "card gedf-card");
    var cardHeader = document.createElement("div");
    cardHeader.setAttribute("class", "card-header");
    var cardHeaderCenter =  document.createElement("div");
    cardHeaderCenter.setAttribute("class", "d-flex justify-content-between align-items-center");
    var cardHeaderCenterCenter =  document.createElement("div");
    cardHeaderCenterCenter.setAttribute("class", "d-flex justify-content-between align-items-center");
    var name = document.createElement("div");
    name.setAttribute("class", "ml-2");
    name.innerHTML = "<div class=\"h5 m-0\">" + username + "</div>";
    cardHeaderCenterCenter.appendChild(name);
    cardHeaderCenter.appendChild(cardHeaderCenterCenter);
    //append dropdown here
    cardHeader.appendChild(cardHeaderCenter);
    
    var cardBody = document.createElement("div");
    cardBody.setAttribute("class", "card-body");
    var time = document.createElement("div");
    time.setAttribute("class","text-muted h7 mb-2");
    var clock = document.createElement("i");
    clock.setAttribute("class","fa fa-clock-o");
    time.appendChild(clock);
    //calculate time here
    //get date and then calculate time and put whatever min ago
    var currTime = new Date();
    var postDate = new Date(date);

    if(currTime.getFullYear() - postDate.getFullYear() >= 1){
        var diff = currTime.getFullYear() - postDate.getFullYear();
        if(diff==1){
            time.innerHTML += "1 year ago";
        }
        else{
            time.innerHTML += diff + " years ago";
        }       
        
    }
    else if(currTime.getMonth() - postDate.getMonth() != 0){
        var diff = currTime.getMonth() - postDate.getMonth();
        if(diff==1){
            time.innerHTML += "1 month ago";
        }
        else{
            time.innerHTML += diff + " months ago";
        }       
        
    }
    else if(currTime.getDay() - postDate.getDay() >= 1){
        var diff = currTime.getDay() - postDate.getDay();
        if(diff==1){
            time.innerHTML += "1 day ago";
        }
        else{
            time.innerHTML += diff + " days ago";
        }       
        
    }
    else if(currTime.getHours() - postDate.getHours() >= 1){
        var diff = currTime.getHours() - postDate.getHours();
        if(diff==1){
            time.innerHTML += "1 hour ago";
        }
        else{
            time.innerHTML += diff + " hours ago";
        }       
        
    }
    else if(currTime.getMinutes() - postDate.getMinutes() >= 1){
        var diff = currTime.getMinutes() - postDate.getMinutes();
        if(diff==1){
            time.innerHTML += "1 min ago";
        }
        else{
            time.innerHTML += diff + " mins ago";
        }       
        
    }
    else{
        time += "Just Now";
    }
    
    var postTitle = document.createElement("h5");
    postTitle.setAttribute("class", "card-title");
    postTitle.innerHTML = title;
    var postDetails = document.createElement("p");
    postDetails.setAttribute("class", "card-text");
    postDetails.innerHTML = details;

    cardBody.appendChild(time);
    cardBody.appendChild(postTitle);
    cardBody.appendChild(postDetails);
    
    var footer = document.createElement("div");
    footer.setAttribute("class", "card-footer");

    var like = document.createElement("a");

    like.setAttribute("onclick", "likePost(this.id)");
    like.setAttribute("class", "card-link");
    like.setAttribute("id", id + "like");
    var imageLike = document.createElement("i");

    if(liked)
        imageLike.setAttribute("class", "like fa fa-thumbs-up");
    else
        imageLike.setAttribute("class", "unlike fa fa-thumbs-up");

    var span = document.createElement("span");
    span.style.color = "black";
    span.innerText = " " + likes;
    imageLike.appendChild(span);
    like.appendChild(imageLike);

    footer.appendChild(like);
    
    post.appendChild(cardHeader);
    post.appendChild(cardBody);
    post.appendChild(footer);

    var posts = document.getElementById("posts");
    posts.appendChild(post);
}

function likePost(clickedID){
    var like = document.getElementById(clickedID);
    var postID = like.parentNode.parentNode.id;
    var imageLike = like.children[0]
    if(imageLike.className.includes("unlike")){
        $.ajax({
            type:"POST",
            url: "/motivate/like",
            data: JSON.stringify({ID:postID}),
            contentType: "application/json",
            success: function(res){
                var span = imageLike.children[0];
                span.innerText = " " + (parseInt(span.innerText) + 1);
                imageLike.setAttribute("class", "like fa fa-thumbs-up");
            }
        });
    }
    else{
        $.ajax({
            type:"POST",
            url: "/motivate/unlike",
            data: JSON.stringify({ID:postID}),
            contentType: "application/json",
            success: function(res){
                var span = imageLike.children[0];
                span.innerText = " " + (parseInt(span.innerText) - 1);
                imageLike.setAttribute("class", "unlike fa fa-thumbs-up");
            }
        });
    }

};

function createMessage(){
    var message = document.getElementById("message").value;
    var title = document.getElementById("title").value;
    $.ajax({
        type:"POST",
            url: "/motivate/createmessage",
            data: JSON.stringify({title: title, message:message}),
            contentType: "application/json",
            success: function(res){
                document.getElementById("message").value = "";
                document.getElementById("title").value = "";
            }
    });
    
}
