const URLApi = 'https://crypto.develotion.com'
const cambio = 41.9;
let map;

document.addEventListener('DOMContentLoaded', function(){
    let router = document.querySelector('ion-router');
    router.addEventListener('ionRouteDidChange', function(e){
        document.getElementById('menu_lateral').close();
        let nav = e.detail;
        let paginas = document.getElementsByTagName('ion-page');
        for(let i=0 ; i<paginas.length; i++){
            paginas[i].style.visibility = "hidden";
        }
        let ion_route = document.querySelectorAll(`[url="${nav.to}"]`)
        let id_pagina = ion_route[0].getAttribute('component');
        let pagina = document.getElementById(id_pagina);
        pagina.style.visibility = "visible";

        if(nav.to == '/monedas'){
            listar_monedas();
        }
        if(nav.to == '/moneda'){
            info_moneda();
        }
        if(nav.to == '/usuarios'){
            info_usuarios();
        }
        if(nav.to == '/transacciones'){
            listar_transacciones();
        }
        if(nav.to == '/inversiones'){
            listar_inversiones();
        }
        if(nav.to == '/inversion'){
            info_inversion();
        }
        if(nav.to == '/cerrarSesion'){
            cerrarSesion();
        }
    });

    document.getElementById('btn_registro').onclick = function(){       
        try{
            let usuario = document.getElementById('inp_usuario').value;
            const password = document.getElementById('inp_password2').value;
            const repassword = document.getElementById('inp_repassword').value;
            const ciudad = document.getElementById('inp_ciudad').value;
            const depto = document.getElementById('inp_depto').value;
            
            if(!usuario){
                throw 'Nombre requerido para continuar';
            }
            if(password != repassword){
                throw 'Contrase&ntilde;a y repetici&oacute;n no coinciden';
            }

            const url = URLApi + '/usuarios.php';
            const datos = {
                "usuario": usuario,
                "password": password,
                "idDepartamento": depto,
                "idCiudad": ciudad
            }
            fetch(url, {
                method:'POST',
                body: JSON.stringify(datos),
                headers:{
                    "Content-type":"application/json"
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.error)))
            .then(data => {
                display_toast('Usuario registrado', 'Info','primary')
                console.log(data);
                login(data, router);
        })
            .catch(() => display_toast('Usuario no ha podido registrarse','Info','primary'))
        }   
        catch(e){
            display_toast(e);
        }
    }

    document.getElementById('btn_login').onclick = function(){
        try{
            let user = document.getElementById('inp_usuarioLogin').value;
            let password = document.getElementById('inp_password').value;
            if(!user){
                throw 'Nombre requerido para continuar';
            }
            if(!password){
                throw 'Contrase&ntilde;a requerida';
            }
            const url = URLApi + '/login.php';
            const datos = {
                "usuario": user,
                "password": password
            }
            fetch(url, {
                method:'POST',
                body: JSON.stringify(datos),
                headers:{
                    "Content-type":"application/json"
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.error)))
            .then(data => login(data, router, user))
            .catch(() => display_toast('No se ha podido ingresar','Info','primary'))
        }
        catch(e){
            display_toast(e);
        }
    }

    document.getElementById('cerrarSesion').onclick = function(){
        localStorage.clear();
        display_toast('Ha cerrado sesion', 'Info', 'primary')
        router.push('/');
    }
});


function login(data, router, usuario){
    localStorage.setItem("apiKey", data.apiKey);
    localStorage.setItem("idUsuario", JSON.stringify(data.id))
    display_toast(usuario, 'Hola!', 'primary')
    router.push('/monedas');
}

function display_toast(mensaje, header, color){
    const toast = document.createElement('ion-toast');
    toast.header = header;
    toast.icon = 'information-circle',
    toast.position = 'top';
    toast.message = mensaje;
    toast.duration = 3000;
    toast.color = color;
    document.body.appendChild(toast);
    toast.present();
}

async function cargando(message){
    const loading = await loadingController.create({
        message: message,
      });
    return await loading;
}

function listar_monedas(){
    cargando('Cargando monedas...').then((loading) => {
        loading.present();
        let key = localStorage.getItem("apiKey");
        const url = URLApi + '/monedas.php';
        fetch(url, {
            headers:{
                "apiKey": key,
                "Content-type":"application/json"
            }
        }).then(respuesta => respuesta.json())
        .then(data => crearListadoMonedas(data))
        .catch(error => display_toast(error, 'Info', 'primary'))
        .finally(() => loading.dismiss())
    });
}

function crearListadoMonedas(data){
    const urlImagen = 'https://crypto.develotion.com/imgs/'
    let lista = document.getElementById('listMonedas');
    lista.innerHTML = '';
    let item = '';
    for (let i = 0; i< data.monedas.length; i++){
        let moneda = data.monedas[i];
        item = `<ion-item href="/moneda?id=${moneda.id}" detail>
        <ion-avatar slot="start">
          <img src="${urlImagen}${moneda.imagen}" />
        </ion-avatar>
        <ion-label>
          <h2>${moneda.nombre}</h2>
          <h3>${moneda.cotizacion}</h3>
          </ion-label>
      </ion-item>`;
      lista.innerHTML += item;
    }
}

function info_moneda(){
    cargando('Cargando monedas...').then((loading) => {
        loading.present();
        const id = getParam('id');
        const url = URLApi + '/monedas.php';
        let key = localStorage.getItem("apiKey");
        fetch(url, {
            headers:{
                "apiKey": key,
                "Content-type":"application/json"
            }
        }).then(respuesta => respuesta.json())
        .then(data => crear_info_moneda(data.monedas[id-1]))
        .finally(() => loading.dismiss())
    });
}


function crear_info_moneda(data){
    urlImagen = 'https://crypto.develotion.com/imgs/' + data.imagen;
    document.getElementById('moneda_imagen').setAttribute('src', urlImagen);
    document.getElementById('moneda_nombre').innerHTML = data.nombre;
    document.getElementById('moneda_cot').innerHTML += data.cotizacion;

    document.getElementById('btn_ingresar').onclick = function(){
        try{
            let operacion = document.getElementById('inp_operacion').value;
            let monto = Math.round(document.getElementById('inp_cdad').value);

            const url = URLApi + '/transacciones.php';
            const idUsuario = localStorage.getItem('idUsuario');
            const key = localStorage.getItem('apiKey');

            const datos = {
                "idUsuario": idUsuario,
                "tipoOperacion": operacion,
                "moneda": data.id,
                "cantidad": monto,
                "valorActual": data.cotizacion
            }
            fetch(url, {
                method:'POST',
                body: JSON.stringify(datos),
                headers:{
                    "apiKey": key,
                    "Content-type":"application/json"
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.error)))
            .then(data => console.log(data))
            // deberiamos poner mostrar mensaje para mostrarle al usuario que se realizo la transaccion
            .catch(mensaje => display_toast(mensaje,'Info','primary'))
        }
        catch(e){
            console.log(e);
        }
    }
}

function getParam(name, url = window.location.href) {
    cargando('Cargando monedas...').then((loading) => {
        loading.present();
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    })
}

function listar_transacciones(){
    cargando('Cargando monedas...').then((loading) => {
        loading.present();
    
        let key = localStorage.getItem("apiKey");
        let idUsuario = localStorage.getItem("idUsuario");
        const url = URLApi + `/transacciones.php?idUsuario=${idUsuario}`;
        fetch(url, {
            headers:{
                "apiKey": key,
                "Content-type":"application/json"
            }
        }).then(respuesta => respuesta.json())
        .then(data => conseguirInfoMonedas(data))
        .finally(() => loading.dismiss())

})
}

function conseguirInfoMonedas(dataTransacciones){
    let key = localStorage.getItem("apiKey");
    const url = URLApi + `/monedas.php`;
    fetch(url, {
        headers:{
            "apiKey": key,
            "Content-type":"application/json"
        }
    }).then(respuesta => respuesta.json())
    .then(data => crearListadoTransacciones(data.monedas,dataTransacciones))

}


function crearListadoTransacciones(monedas,data){


    let lista = document.getElementById('listTransacciones');
    lista.innerHTML = '';
    let item = '';
    
    for (let i = 0; i< data.transacciones.length; i++){
        let trans = data.transacciones[i];

        let tipoOperacion;
        if(trans.tipo_operacion == 1){
            tipoOperacion = 'compra'
        } else { 
            tipoOperacion = 'venta'
        }
        item = `
        <ion-item>
        <ion-label>
        <h2>Moneda: ${monedas[trans.moneda-1].nombre}</h2>
        <h3>Operacion: ${tipoOperacion}</h3>
        <h3>Cantidad: ${trans.cantidad}</h3>
        <h3>Valor de la moneda: ${trans.valor_actual}</h3>
        </ion-label>
        </ion-item>`;
        lista.innerHTML += item;
    }

    let select = document.getElementById('inp_filtroMoneda');
    let option = '';
    
    for (let i = 0; i< monedas.length; i++){
        let mon = monedas[i];
        
        option = `
        <ion-select-option value="${mon.id}">${mon.nombre}</ion-select-option>
        `;
        select.innerHTML += option;
    }

    document.getElementById('btn_filtrar').onclick = function(){
        let monIngresada = document.getElementById('inp_filtroMoneda').value
        lista.innerHTML='';
        for (let i = 0; i< data.transacciones.length; i++){
            let trans = data.transacciones[i];
            if(monIngresada==trans.moneda){
                let tipoOperacion;
                if(trans.tipo_operacion == 1){
                    tipoOperacion = 'compra'
                } else { 
                    tipoOperacion = 'venta'
                }
                item = `
                <ion-item>
                <ion-label>
                <h2>Moneda: ${monedas[trans.moneda-1].nombre}</h2>
                <h3>Operacion: ${tipoOperacion}</h3>
                <h3>Cantidad: ${trans.cantidad}</h3>
                <h3>Valor de la moneda: ${trans.valor_actual}</h3>
                </ion-label>
                </ion-item>`;
                lista.innerHTML += item;
                
            }
        }
    }
}


function listar_inversiones(){
    let key = localStorage.getItem("apiKey");
    let idUsuario = localStorage.getItem("idUsuario");
    const url = URLApi + `/transacciones.php?idUsuario=${idUsuario}`;
    fetch(url, {
        headers:{
            "apiKey": key,
            "Content-type":"application/json"
        }
    }).then(respuesta => respuesta.json())
    .then(data => conseguirInfoMonedasParaInversiones(data))
}

function conseguirInfoMonedasParaInversiones(dataTransacciones){
    let key = localStorage.getItem("apiKey");
    const url = URLApi + `/monedas.php`;
    fetch(url, {
        headers:{
            "apiKey": key,
            "Content-type":"application/json"
        }
    }).then(respuesta => respuesta.json())
    .then(data => crearListadoInversiones(data.monedas,dataTransacciones))
    .finally(() => loading.dismiss())

}

function crearListadoInversiones(monedas,data){
    let lista = document.getElementById('listInversiones');
    lista.innerHTML = '';
    let item = '';

    for (let i = 0; i< monedas.length; i++){
        let moneda = monedas[i];
        let totalMoneda =getMontoMoneda(moneda.id,data);

        item = `
        <ion-item>
        <ion-label>
        <h2>Moneda: ${moneda.nombre}</h2>
        <h3>Monto invertido: ${totalMoneda}</h3>
        </ion-label>
        </ion-item>`;
        lista.innerHTML += item;
    }

}

function getMontoMoneda(id, data){
    let monto=0;
    for (let i = 0; i< data.transacciones.length; i++){
        let trans=data.transacciones[i]
        if (trans.moneda==id && trans.tipo_operacion==1) {
            monto=monto+(trans.cantidad*trans.valor_actual);      
        }
    }
    return monto;
}   

function info_inversion(){
    let key = localStorage.getItem("apiKey");
    let idUsuario = localStorage.getItem("idUsuario");
    const url = URLApi + `/transacciones.php?idUsuario=${idUsuario}`;
    fetch(url, {
        headers:{
            "apiKey": key,
            "Content-type":"application/json"
        }
    }).then(respuesta => respuesta.json())
    .then(data => mostrarInversion(data.transacciones))
    .finally(() => loading.dismiss())

}

function mostrarInversion(data){
    let monto = 0;
    for (let i = 0; i < data.length; i++){
        let trans =data[i]
        if (trans.tipo_operacion==1){
            monto= monto+(trans.cantidad*trans.valor_actual);
        } else {monto=monto-(trans.cantidad*trans.valor_actual)}
    }
    monto=Math.round(monto*cambio);
    document.querySelector("#montoInvertido").innerHTML=monto+" UYU"
}

function info_usuarios(){
    cargando('Cargando usuarios...').then((loading) => {
        loading.present();
        let key = localStorage.getItem("apiKey");
        const url = URLApi + `/usuariosPorDepartamento.php`;
        fetch(url, {
            headers:{
                "apiKey": key,
                "Content-type":"application/json"
            }
        }).then(respuesta => respuesta.json())
        .then(data => info_departamentos(data.departamentos))
        .finally(() => loading.dismiss())

    })
}

function info_departamentos(usuariosPorDepto){
    cargando('Cargando departamentos...').then((loading) => {
        loading.present();
        let key = localStorage.getItem("apiKey");
        const url = URLApi + `/departamentos.php`;
        fetch(url, {
            headers:{
                "apiKey": key,
                "Content-type":"application/json"
            }
        }).then(respuesta => respuesta.json())
        .then(data => crear_Mapa(data.departamentos, usuariosPorDepto))
        .finally(() => loading.dismiss())
})
}

function crear_Mapa(deptos, cdadUsuarios){
    if(map != undefined){
        map.remove();
    } 
    map = L.map('map').setView([-33, -56], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    for(let i=0; i<cdadUsuarios.length; i++){
        depto = deptos[i]
        cdad = cdadUsuarios[i];
        L.marker([depto.latitud, depto.longitud]).addTo(map)
            .bindPopup(`<strong>${depto.nombre}</strong><br/>${cdad.cantidad_de_usuarios}`)
            .openPopup();
    }
}
