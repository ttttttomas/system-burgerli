import axios from "axios";

type User = {
  username: string;
  password: string;
};

export default function useAuth() {
  const login = async ({username, password}: User) => {
    const res = await axios.post(
      // "http://localhost:8000/token",
      `https://burgerli.ar/MdpuF8KsXiRArNlHtl6pXO2XyLSJMTQ8_Burgerli/api/token`,
      {username, password},
      {
        withCredentials: true,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        validateStatus: (s) => s < 500,
      },
    );
    // if (res.data === null) {
    //   throw new Error("Credenciales inválidas");
    // }
    // MAPEÁ SIEMPRE A UN NOMBRE CONSISTENTE
    const api = res.data;
    const id = String(api.id ?? api.id);

    if (!id) throw new Error("Falta user_id en la respuesta");

    return res;
  };

  const verifyCookie = async () => {
    try {
      const response = await axios.get(
        // "http://localhost:8000/verify-cookie"
        `https://burgerli.ar/MdpuF8KsXiRArNlHtl6pXO2XyLSJMTQ8_Burgerli/api/verify-cookie`
        , {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.get(`https://burgerli.ar/MdpuF8KsXiRArNlHtl6pXO2XyLSJMTQ8_Burgerli/api/me`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await axios.delete(`https://burgerli.ar/MdpuF8KsXiRArNlHtl6pXO2XyLSJMTQ8_Burgerli/api/deleteOrder/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await axios.get(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/logout`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );      
      if (response.status === 200) {
        return response;
      }
    }
    catch (error) {console.error(error)}
  }

  const getOrdersWithConfirmed = async (local: any) => {
    try {
      const response = await axios.get(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getOrdersByLocalStatusConfirmed/${local}`, {    
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
    }

  const getLocals = async () => {
    try {
      const response = await axios.get(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getLocals`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
    }

    return {login, verifyCookie, logout, getCurrentUser, deleteOrder, getOrdersWithConfirmed, getLocals};
}
