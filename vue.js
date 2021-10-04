$(document).on('click', '.btn-main', function(e) {
    let idMainBtn = e.target.id;
    hideAll();
    showQuestion(idMainBtn);
});

function hideAll() {
    let questions = document.getElementsByClassName("QBloc");

    for (let i = 0; i < questions.length; i++) {
        if(!questions[i].classList.contains('hide')) {
            questions[i].classList.add("hide");
        }
    }
}

function showQuestion(idMainBtn) {
    let questions = document.getElementsByClassName("QBloc");
    switch (idMainBtn) {
        case 'Q1':
            questions[0].classList.remove("hide");
            break;
        case 'Q2':
            questions[1].classList.remove("hide");
            break;
        case 'Q3':
            questions[2].classList.remove("hide");
            break;
        case 'Q4':
            questions[3].classList.remove("hide");
            break;
        case 'Q5':
            questions[4].classList.remove("hide");
            break;
    }
}