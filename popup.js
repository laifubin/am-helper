(function() {
  const loginEl = document.getElementById('login')
  const accountEl = document.getElementById('account')
  const el = document.createElement('span')
  loginEl.addEventListener('click', (e) => {
    const v = accountEl.value
    console.log(v, 'vv');
    el.innerHTML = v
    document.body.append(el)

  })
})(window)