function processForm() {
  const personas = document.getElementById('personas').value.split('\n').map(p => p.trim()).filter(p => p);
  const numero = parseInt(document.getElementById('numero').value);
  const order = document.querySelector('input[name="order"]:checked').value;

  let isValid = true;

  const personasError = document.getElementById('personas-error');
  const numeroError = document.getElementById('numero-error');

  if (!personas.length) {
    personasError.textContent = 'Por favor, ingresa los nombres.';
    personasError.style.display = 'block';
    isValid = false;
  } else {
    personasError.style.display = 'none';
  }


  if (isNaN(numero) || numero < 1 || numero > 8) {
    numeroError.textContent = 'Por favor, ingresa un número de grupos válido (entre 1 y 8).';
    numeroError.style.display = 'block';
    isValid = false;
  } else if (personas.length < numero) {
    numeroError.textContent = 'La cantidad de personas debe ser mayor o igual a la cantidad de grupos.';
    numeroError.style.display = 'block';
    isValid = false;
  } else {
    numeroError.style.display = 'none';
  }


  if (!isValid) {
    return;
  }

  if (order === 'random') {
    personas.sort(() => Math.random() - 0.5);
  }

  const grupos = [];
  const icons = ['img/icon1.png', 'img/icon2.png', 'img/icon3.png', 'img/icon4.png', 'img/icon5.png', 'img/icon6.png', 'img/icon7.png','img/icon8.png','img/icon9.png','img/icon10.png'];

  for (let i = 0; i < numero; i++) {
    grupos.push({
      name: '',
      image: icons[i % icons.length],
      members: []
    });
  }

  personas.forEach((persona, index) => {
    grupos[index % numero].members.push(persona);
  });

  localStorage.setItem('grupos', JSON.stringify(grupos));
  window.location.href = '2.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const grupos = JSON.parse(localStorage.getItem('grupos')) || [];
  const groupList = document.getElementById('groupList');

  grupos.forEach((grupo, index) => {
    const groupItem = document.createElement('li');
    groupItem.className = 'group-item';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';

    const groupIcon = document.createElement('img');
    groupIcon.className = 'group-icon';
    groupIcon.src = grupo.image;
    groupIcon.addEventListener('click', () => {
      openModal(index, groupIcon);
    });

    const groupNameInput = document.createElement('input');
    groupNameInput.className = 'group-name-input';
    groupNameInput.value = grupo.name || `GRUPO ${index + 1}`;
    groupNameInput.addEventListener('blur', function () {
      grupos[index].name = this.value;
      localStorage.setItem('grupos', JSON.stringify(grupos));
    });

    const toggle = document.createElement('div');
    toggle.className = 'toggle';
    toggle.innerHTML = '<img src="img/flecha.webp" alt="Descripción de la imagen" style="width: 30px; height: 20px;">';

    const nameList = document.createElement('ul');
    nameList.className = 'name-list';
    nameList.style.display = 'none'; // Asegurarse de que esté inicialmente oculto

    grupo.members.forEach(nombre => {
      const nameItem = document.createElement('li');
      nameItem.textContent = nombre;
      nameList.appendChild(nameItem);
    });

    toggle.addEventListener('click', () => {
      nameList.style.display = nameList.style.display === 'none' ? 'block' : 'none';
    });

    groupHeader.appendChild(groupIcon);
    groupHeader.appendChild(groupNameInput);

    groupItem.appendChild(groupHeader);
    groupItem.appendChild(toggle);
    groupItem.appendChild(nameList);

    groupList.appendChild(groupItem);
  });
});

function openModal(groupIndex, groupIconElement) {
  const modal = document.getElementById('iconModal');
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = '<button class="close-button" onclick="closeModal()">×</button>';

  const grupos = JSON.parse(localStorage.getItem('grupos')) || [];
  const usedIcons = grupos.map(grupo => grupo.image);
  const icons = ['img/icon1.png', 'img/icon2.png', 'img/icon3.png', 'img/icon4.png', 'img/icon5.png', 'img/icon6.png', 'img/icon7.png','img/icon8.png','img/icon9.png','img/icon10.png'];

  icons.forEach(icon => {
    const iconElement = document.createElement('img');
    iconElement.src = icon;
    iconElement.className = 'modal-icon';
    if (usedIcons.includes(icon)) {
      iconElement.classList.add('disabled');
    } else {
      iconElement.addEventListener('click', () => {
        grupos[groupIndex].image = icon;
        localStorage.setItem('grupos', JSON.stringify(grupos));
        modal.style.display = 'none';
        updateGroupIcon(groupIconElement, icon);
      });
    }
    modalContent.appendChild(iconElement);
  });

  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('iconModal');
  modal.style.display = 'none';
}

function updateGroupIcon(groupIconElement, icon) {
  groupIconElement.src = icon;
}

function exportToTxt() {
  const grupos = JSON.parse(localStorage.getItem('grupos')) || [];
  if (!grupos) return;

  let txtContent = '';
  grupos.forEach((grupo, index) => {
    txtContent += `${grupo.name || `Grupo ${index + 1}`}:\n`;
    grupo.members.forEach(nombre => {
      txtContent += `  ${nombre}\n`;
    });
    txtContent += '\n';
  });

  const blob = new Blob([txtContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'grupos.txt';
  a.click();
}

function exportToExcel() {
  const grupos = JSON.parse(localStorage.getItem('grupos')) || [];
  if (!grupos) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Grupos');

  // Añadimos encabezados de columnas
  worksheet.columns = [
      { header: 'Icono', key: 'icono', width: 15 },
      { header: 'Nombre del Grupo', key: 'nombre', width: 25 },
      { header: 'Integrantes', key: 'integrantes', width: 50 }
  ];

  grupos.forEach((grupo, index) => {
      // Agregar espacio adicional para el icono
      const startRow = worksheet.actualRowCount + 1;

      const row = worksheet.addRow({
          icono: '',  // La imagen se añadirá después
          nombre: grupo.name || `Grupo ${index + 1}`,
          integrantes: grupo.members.join(', ')
      });

      // Añadir imagen a la celda, ocupando varias filas
      const imageId = workbook.addImage({
          base64: getBase64Image(grupo.image),
          extension: 'webp'
      });

      worksheet.addImage(imageId, {
          tl: { col: 0, row: startRow - 1 },
          ext: { width: 50, height: 50 }
      });

      // Añadir filas vacías adicionales para dar espacio a la imagen
      for (let i = 0; i < 3; i++) {
          worksheet.addRow({});
      }
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'grupos.xlsx';
      a.click();
  });
}

// Función para convertir una URL de imagen a base64
function getBase64Image(url) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/webp').split(',')[1];  // Obtener solo la parte base64
}