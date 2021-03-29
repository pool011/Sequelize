async function windowActions() {
  const endpoint = '/api/dining';
  const request = await fetch(endpoint);
  const allDiningHalls = await request.json();

  const tableBody = document.querySelector('#hall-list tbody');
  allDiningHalls.data.forEach((hall) => {
    newRow = document.createElement('tr');
    newRow.innerHTML = `<th>${hall.hall_id}</th><td>${hall.hall_name}</td><td>${hall.hall_address}</td>`;
    tableBody.append(newRow);
  });
}
window.onload = windowActions;