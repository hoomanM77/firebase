////////////////////Variables//////////////////////////////////////
const $=document
let allData=null
const editModal = new bootstrap.Modal(document.getElementById('editModal'))
let targetEditId,targetEditButton
/////////////// Catching Elements with functions////////////////////
function _id(tag) {
    return  $.getElementById(tag)
}
function _class(tag) {
    return $.getElementsByClassName(tag)
}
function _q(tag) {
    return $.querySelector(tag)
}
function _qAll(tag) {
    return $.querySelectorAll(tag)
}
/////////////////////////////////////////
class UI {
    constructor() {
        this.formSubmit=_id('submit_form')
        this.email=_id('email')
        this.password=_id('password')
        this.message=_id('message')
        this.userContainer=_id('user_container')
        this.emailRegex=/^([^\_\.])([a-zA-Z0-9\.\_])+@(\w{4,6})\.(\w{2,3})$/
        this.passwordRegex=/^([\w\d\@\.\#\s]){8,12}$/

        this.editEmail=_id('edit_email')
        this.editPassword=_id('edit_password')
        this.editMessage=_id('edit_message')
        this.editBtn=_id('edit_btn')

    }
    clearInputs(){
        this.email.value=''
        this.password.value=''
        this.message.value=''
    }
    clearModalInputs(){
        this.editEmail.value=''
        this.editPassword.value=''
        this.editMessage.value=''
    }
    createRow(newUser){
        this.userContainer.insertAdjacentHTML('beforeend',`<tr style="vertical-align: middle" ><th scope="row">${newUser?.id}</th><td>${newUser?.userEmail}</td><td>${newUser?.userPassword}</td><td>${newUser?.userMessage}</td><td><button class="btn btn-outline-danger" data-userid="${newUser?.id}">remove</button></td><td><button data-userid="${newUser?.id}" class="btn btn-outline-primary"  data-bs-toggle="modal" data-bs-target="#editModal">Edit</button></td></tr>`)
    }
}
class USER {
    constructor(userEmail,userPassword,userMessage) {
        this.id=Math.floor(Math.random()*999999)
        this.userEmail=userEmail
        this.userPassword=userPassword
        this.userMessage=userMessage
    }
}
class API {
    constructor() {
        this.url='https://fir-project-a8497-default-rtdb.firebaseio.com/users.json'
        this.req=null

    }
    getUniqueId(userId){
        let targetRow=Object.entries(allData).filter(data=>{
            return data[1].id === Number(userId)
        })
        return targetRow[0][0]
    }
    async sendData(newUser){
        this.req=await fetch(this.url,{
            method:'POST',
            headers:{
                'content-type':'application/json'
            },
            body:JSON.stringify(newUser)
        })

        if(this.req.ok){
            return await this.req.json()
        }else{
            throw Error(`${this.req.status}`)
        }

    }
    async getData(){
        this.req=await fetch(this.url)
        if(this.req.ok){
            return await this.req.json()
        }else{
            throw Error(`${this.req.status}`)
        }
    }
    async deleteData(userId){
        this.req=await fetch(`https://fir-project-a8497-default-rtdb.firebaseio.com/users/${this.getUniqueId(userId)}.json`,{
            method:'delete'
        })
        if(this.req.ok){
            return await this.req.json()
        }else{
            throw  Error(`${this.req.status}`)
        }

    }
    async editData(userId,email,password,message){
        this.req=await fetch(`https://fir-project-a8497-default-rtdb.firebaseio.com/users/${this.getUniqueId(userId)}.json`,{
            method:'PUT',
            headers:{
                'content-type':'application/json'
            },
            body:JSON.stringify({
                id:userId,
                userEmail:email,
                userPassword:password,
                userMessage:message,
            })
        })
        if(this.req.ok){
            return await this.req.json()
        }else{
            throw  Error(`${this.req.status}`)
        }


    }
}

let ui=new UI()
let api=new API()

ui.userContainer.addEventListener('click',e=>{
    if(e.target.classList.contains('btn-outline-danger')){
        let userId=e.target.dataset.userid
        e.target.parentElement.parentElement.remove()

        api.deleteData(userId).then(result=>{
            console.log(result)
        }).catch(error=>{
            console.log(error)
        })

    }else if(e.target.classList.contains('btn-outline-primary')){
        targetEditButton=e.target
        targetEditId=Number(e.target.dataset.userid)
        let targetEditRowDetail=Object.entries(allData).filter(data=>{
            return data[1].id === Number(targetEditId)
        })
        let targetObjEdit=targetEditRowDetail[0][1]
        ui.editEmail.value=targetObjEdit.userEmail
        ui.editPassword.value=targetObjEdit.userPassword
        ui.editMessage.value=targetObjEdit.userMessage
    }

})
ui.editBtn.addEventListener('click',e=>{
    if(ui.emailRegex.test(ui.editEmail.value) && ui.passwordRegex.test(ui.editPassword.value) && isNaN(ui.editMessage.value)){
        targetEditButton.parentElement.parentElement.children[1].innerHTML=ui.editEmail.value
        targetEditButton.parentElement.parentElement.children[2].innerHTML=ui.editPassword.value
        targetEditButton.parentElement.parentElement.children[3].innerHTML=ui.editMessage.value
        console.log(targetEditButton)
        api.editData(targetEditId,ui.editEmail.value,ui.editPassword.value,ui.editMessage.value).then(result=>{
            console.log(result)
        }).catch(error=>{
            console.log(error)
        })
        editModal.hide()
    }else{
        alert('Invalid email or password!')
    }

})
ui.formSubmit.addEventListener('submit',e=>{
    e.preventDefault()
    if(ui.emailRegex.test(ui.email.value) && ui.passwordRegex.test(ui.password.value) && isNaN(ui.message.value)){

        let newUser=new USER(ui.email.value,ui.password.value,ui.message.value)

        api.sendData(newUser).then(result=>{
            console.log(result)
        }).catch(error=>{
            console.log(error)
        })
        ui.createRow(newUser)
        ui.clearInputs()
    }else{
        alert('Invalid email or password!')
    }


})
window.addEventListener('load',()=>{
    api.getData().then(result=>{
        allData=result
        Object.entries(result).forEach(user=>{
            ui.createRow(user[1])
        })
    }).catch(error=>{
        console.log(error)
    })

    ui.clearModalInputs()
    ui.clearInputs()
})
