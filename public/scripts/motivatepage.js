//What the post should look like

/*
<!-- html for a single post-->
    <div class="card gedf-card">
      <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex justify-content-between align-items-center">
                  Not including this part
                  <div class="mr-2">
                      <img class="rounded-circle" width="45" src="https://picsum.photos/50/50" alt="">
                  </div>
                  <div class="ml-2">
                      <div class="h5 m-0">LeeCross</div>
                  </div>
              </div>
              <div>
                  <div class="dropdown">
                      <button class="btn btn-link dropdown-toggle" type="button" id="gedf-drop1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i class="fa fa-ellipsis-h"></i>
                      </button>
                      <div class="dropdown-menu "dropdown-menu-right" aria-labelledby="gedf-drop1">
                          <div class="h6 dropdown-header">Configuration</div>
                          <a class="dropdown-item" href="#">Save</a>
                          <a class="dropdown-item" href="#">Report</a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="card-body">
          <div class="text-muted h7 mb-2"> <i class="fa fa-clock-o"></i>10 min ago</div>
          <not adding anchor for now"
          <a class="card-link" href="#">
            <!--Title of the post-->
              <h5 class="card-title" id="title"> Lorem ipsum dolor sit amet, consectetur adip.</h5>
          </a>
          <!--details-->
          <p class="card-text">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo recusandae nulla rem eos ipsa praesentium esse magnam nemo dolor
              sequi fuga quia quaerat cum, obcaecati hic, molestias minima iste voluptates.
          </p>
      </div>
      <!-- comment and stuff-->
      <div class="card-footer">
          <a href="#" class="card-link"><i class="fa fa-gittip"></i> Like</a>
          <a href="#" class="card-link"><i class="fa fa-comment"></i> Comment</a>
      </div>
    </div>
*/

function create_post(id, username, date, title, details){
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
    time.innerHTML = time.innerHTML += "10 min ago";
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
    like.setAttribute("href", "#");
    like.setAttribute("class", "card-link");
    var imageLike = document.createElement("i");
    imageLike.setAttribute("class", "fa fa-gittip");
    like.appendChild(imageLike);
    like.innerHTML = like.innerHTML + " Like";

    var comment = document.createElement("a");
    comment.setAttribute("href", "#");
    comment.setAttribute("class", "card-link");
    var imageComment = document.createElement("i");
    imageComment.setAttribute("class", "fa fa-comment");
    comment.appendChild(imageComment);
    comment.innerHTML = comment.innerHTML + " Comment";

    footer.appendChild(like);
    footer.appendChild(comment);
    post.appendChild(cardHeader);
    post.appendChild(cardBody);
    post.appendChild(footer);

    var posts = document.getElementById("posts");
    posts.appendChild(post);

}

create_post("rachely", "rachely", "10", "test post","success");