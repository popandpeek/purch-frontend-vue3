<template>
  <header>
    <nav>
      <h1>
        <router-link to="/">
          PURCH
        </router-link>
      </h1>
      <ul>
        <li>
          <router-link to="/orders">
            House Orders
          </router-link>
        </li>
        <li>
          <router-link to="/items">
            House Items
          </router-link>
        </li>
        <li>
          <router-link to="/inventories">
            Inventories
          </router-link>
        </li>
        <li>
          <router-link to="/vendors">
            Vendors
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
  width: 100%;
  height: 5rem;
  background-color: #3d008d;
  display: flex;
  justify-content: center;
  align-items: center;
}

header a {
  @import url('https://fonts.googleapis.com/css?family=Proza+Libre');
  font-family: 'Proza Libre', sans-serif;
  font-weight: 500;
  text-decoration: none;
  color: #f391e3;
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
}

a:active,
a:hover,
a.router-link-active {
  border: 1px solid #f391e3;
}

h1 {
  margin: 0;
}

h1 a {
  @import url('https://fonts.googleapis.com/css?family=Proza+Libre');
  font-family: 'Proza Libre', sans-serif;
  font-weight: 500;
  color: white;
  margin: 0;
}

h1 a:hover,
h1 a:active,
h1 a.router-link-active {
  border-color: transparent;
}

header nav {
  width: 90%;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

li {
  margin: 0 0.5rem;
}
</style>