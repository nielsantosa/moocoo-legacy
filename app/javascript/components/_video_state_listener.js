import { fetchWithToken } from "../utils/fetch_with_token";

const initAddEventListenerToVideo = () => {
  if (myTime) {
    clearInterval(myTime);
  }
  if (window.location.href.split("/").slice(-2)[0] === "videos" && Number.isInteger(parseInt(window.location.href.split("/").slice(-1)[0],10))) {

    var myTime=setInterval(function () {myTimer()}, 1000);

    // 2a. Set the player size
    let widthMultiplier = 0.8;
    if (window.innerWidth <= 480) {
      widthMultiplier = 0.92;
    }
    // const playerWidth = widthMultiplier * window.innerWidth;
    const playerWidth = window.innerWidth;
    const playerHeight = 9/16*playerWidth;

    // Set the width of the big-player-container
    document.querySelector(".big-player-container").style.height = `${playerHeight}px`;
    document.querySelector(".big-player-container").style.width = playerWidth;

    const annotations = document.querySelectorAll(".annotations .annotation");
    annotations.forEach((annotation)=>{
      annotation.style.zIndex = "999";
    });
    let annotationsArray = [];

    annotations.forEach((annotation, index) => {
      let annotationHash = {
        id: index,
        annotationElement : annotation,
        timeStart: annotation.dataset.timeStart,
        timeEnd: annotation.dataset.timeEnd,
        xCoordinate: annotation.dataset.xCoordinate,
        yCoordinate: annotation.dataset.yCoordinate
      };
      annotationsArray.push(annotationHash);
      //annotation.style.top = `${Math.floor(annotationHash.xCoordinate*100)}%`;
      //annotation.style.left = `${Math.floor(annotationHash.yCoordinate*100)}%`;
    });

    function myTimer() {
      console.log("Time is ticking");
      let videoCurrentTime = player.getCurrentTime();

      annotationsArray.forEach((aHash)=> {
        if (videoCurrentTime >= aHash.timeStart && videoCurrentTime <= aHash.timeEnd) {
          aHash.annotationElement.style.display = "flex";
        } else {
          aHash.annotationElement.style.display = "none";
        }
      })
    }

    const clickAnnotationCircle = (e) => {
      e.preventDefault();
      console.log("CLICKED");
      e.currentTarget.parentElement.querySelector(".annotation-product").classList.toggle("annotation-product-none");
      //e.currentTarget.parentElement.querySelector(".annotation-product-text").classList.toggle("annotation-product-text-active");
    }

    annotations.forEach((annotation) => {
      annotation.querySelector(".annotation-button").addEventListener('click', clickAnnotationCircle);
    })

    const clickAddToCart = (e) => {
      console.log(e.currentTarget);
      // For shaking animation after clicked
      e.currentTarget.classList.add("apply-shake");

      const productId = parseInt(e.currentTarget.dataset.productId, 10);
      // console.log(e.currentTarget.parentElement.parentElement);
      // fetch url!!
      // const crsfToken = document.querySelector("[name='csrf-token']").content;

      fetchWithToken("/orders", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product: {
            product_id: productId,
            quantity: 1
          }
        })
      })
      .then(response => response.json())
      .then((data) => {
        console.log(data);
      });
    };

    const addToCart = () => {
      const badge = document.querySelector(".cart-badge");
      let cartQty = 0;
      fetch("/cart.json")
        .then(response => response.json())
        .then((data) => {
          const orders = data.orders;
          var i;
          for (i=0; i < orders.length; i++) {
            cartQty += orders[i].quantity;
            badge.innerText = cartQty;
          }
        })
    };

    const removeAlert = () => {
      if (document.getElementById("alertcart")) {
        let myobj = document.getElementById("alertcart");
        myobj.remove();
      }
    };

    const addAlert = (element) => {
      removeAlert();
      element.insertAdjacentHTML("beforeend", `<div id="alertcart" class="alert alert-warning alert-dismissible fade show m-1" role="alert">
            Successfully added to cart
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`);
    };

    const addErrorAlert = (element) => {
      removeAlert();
      element.insertAdjacentHTML("beforeend", `<div id="alertcart" class="alert alert-warning alert-dismissible fade show m-1" role="alert">
            Please sign in before adding to cart
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`);
    };

    const annotationCarts = document.querySelectorAll(".annotations .annotation-add-to-cart")
    annotationCarts.forEach((annotationCart) => {
      annotationCart.addEventListener('animationend',(e) => {
        e.currentTarget.classList.remove("apply-shake");
      })


      annotationCart.addEventListener('click', (e) => {
        e.preventDefault();
        clickAddToCart(e);
        addAlert(e.currentTarget.parentElement);
        addToCart();
      });
    });
  }
};

export { initAddEventListenerToVideo };
