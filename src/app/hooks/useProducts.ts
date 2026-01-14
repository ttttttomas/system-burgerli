import axios from "axios";

export default function useProducts() {
  const getPromos = async () => {
    try {
      const response = await axios.get(
        "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/promos",
      );
      if (!response) {
        return null;
      }
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Not promos found");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };

  const getBurgers = async () => {
    try {
      const response = await axios.get(
        "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/burgers",
      );
      if (!response) {
        return null;
      }
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Not fries found");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };
  const getFries = async () => {
    try {
      const response = await axios.get(
        "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/fries",
      );
      if (!response) {
        return null;
      }
      if (response.status === 200) {
        console.log(response.data);
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Not burgers found");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };

  const getDrinks = async () => {
    try {
      const response = await axios.get(
        "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/drinks",
      );
      if (!response) {
        return null;
      }
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Not drinks found");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };

  const createOrder = async (order: any) => {
    const response = await fetch(
      "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/createOrder",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order), // <-- objeto, NO array
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(
        `Error API externa: ${response.status} ${response.statusText} – ${err}`,
      );
    }

    const createdOrder = await response.json();
    console.log("✅ Orden creada exitosamente:", createdOrder);
    return createdOrder;
  };

  const getOrder = async (id: string) => {
    try {
      const response = await axios.get(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/orders/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Invalid username or password");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };

  const getCoupons = async () => {
    try {
      const response = await axios.get(
        "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/coupons",
      );
      if (!response) {
        return null;
      }
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        // Si es error 404 o 500, significa que no hay cupones, retornar array vacío
        if (error.response.status === 404 || error.response.status === 500) {
          console.log("No coupons found, returning empty array");
          return [];
        } else if (error.response.status === 400) {
          console.error("Not coupons found");
          return [];
        } else {
          console.error(error);
          return [];
        }
      } else {
        console.error("An unexpected error occurred");
        return [];
      }
    }
  };
  return {
    getBurgers,
    getDrinks,
    getPromos,
    getOrder,
    getFries,
    getCoupons,
    createOrder,
  };
}
