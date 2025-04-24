import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../lib/auth-context";
import { User } from "../types/interfaces";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();

  const from = location.state?.from || "/events";

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        navigate(from, { replace: true });
      }
    };

    checkAuth();
  }, [isAuthenticated, navigate, from]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleRegister = async (role: User["role"]) => {
    await form.trigger(); // Validate the form first
    if (!form.formState.isValid) {
      toast({
        title: "Error de Validación",
        description: "Por favor corrige los errores del formulario.",
        variant: "destructive",
      });
      return;
    }

    const values = form.getValues();
    setIsLoading(true);
    try {
      const success = await register(
        values.name,
        values.email,
        values.password,
        role
      );

      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Error de registro:", error);
      let errorMessage = "Error al registrar usuario";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Event Booking App</h1>
          <p className="mt-2 text-gray-600">Crea una nueva cuenta</p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {" "}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu nombre"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="contraseña123"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                className="flex-1"
                onClick={() => handleRegister("user")}
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse como Usuario"}
              </Button>
              <Button
                type="button"
                className="flex-1"
                variant="secondary"
                onClick={() => handleRegister("admin")}
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse como Admin"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
