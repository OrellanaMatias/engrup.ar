function processForm() {
  const personas = document.getElementById('personas').value.split('\n').map(p => p.trim()).filter(p => p);
  const numero = parseInt(document.getElementById('numero').value);
  const order = document.querySelector('input[name="order"]:checked').value;

  if (order === 'random') {
    personas.sort(() => Math.random() - 0.5);
  }

  const grupos = [];
  for (let i = 0; i < numero; i++) {
    grupos.push({
      name: '',
      image: '',
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

  const icons = ['img/icon1.png', 'img/icon2.png', 'img/icon3.png', 'img/icon4.png'];

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
    toggle.innerHTML = '<img src="img/flecha.png" alt="Descripción de la imagen" style="width: 20px; height: 10px;">';

    const nameList = document.createElement('ul');
    nameList.className = 'name-list';

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
  const icons = ['img/icon1.png', 'img/icon2.png', 'img/icon3.png', 'img/icon4.png'];

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

function updateGroupIcon(groupIcon, iconUrl) {
  groupIcon.src = iconUrl;
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

  const worksheetData = [];
  grupos.forEach((grupo, index) => {
    worksheetData.push([grupo.name || `Grupo ${index + 1}`]);
    grupo.members.forEach(nombre => {
      worksheetData.push([nombre]);
    });
    worksheetData.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupos');

  XLSX.writeFile(workbook, 'grupos.xlsx');
}
