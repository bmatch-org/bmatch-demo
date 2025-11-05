import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ConsentForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    email: '',
    aceptaTerminos: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (!formData.rut || !formData.nombre) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.aceptaTerminos) {
      toast.error('Debe aceptar los términos y condiciones');
      return;
    }
    if (!formData.email) {
      toast.error('Por favor ingrese su correo electrónico');
      return;
    }
    
    // Aquí se envía la información al backend
    try {
        // Aquí reemplazamos el comentario por este fetch
        const res = await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            rutEmpresa: formData.rut,   // o como se llame tu campo
            email: formData.email,
            aceptaTerminos: formData.aceptaTerminos,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          toast.error(data.error || 'No se pudo registrar el consentimiento');
          return;
        }

        setSubmitted(true);
        toast.success('Consentimiento registrado exitosamente');
      } catch (err) {
        toast.error('Error de red o de servidor');
      }
  };


  if (submitted) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-green-700 mb-4">¡Consentimiento Registrado!</h2>
          <p className="text-muted-foreground mb-6">
            Hemos enviado una confirmación a <strong>{formData.email}</strong>
          </p>
          <p className="text-muted-foreground">
            Gracias por participar en nuestro programa de descuentos. Pronto recibirá información sobre los beneficios disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      {step === 1 ? (
        <>
          <CardHeader>
            <CardTitle>Datos del Autorizador</CardTitle>
            <CardDescription>
              Por favor ingrese la información de la empresa y del autorizador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rut">RUT de la Empresa</Label>
              <Input
                id="rut"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={(e) => handleInputChange('rut', e.target.value)}
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Autorizador</Label>
              <Input
                id="nombre"
                placeholder="Juan Pérez González"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="bg-input-background"
              />
            </div>
            
            {/* Benefits highlight */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-900 mb-2">Beneficios del Convenio</h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Descuentos especiales para clientes libres</li>
                    <li>• Acceso a promociones exclusivas</li>
                    <li>• Análisis de consumo personalizado</li>
                    <li>• Recomendaciones de ahorro energético</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleNextStep} className="w-full">
              Continuar
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Términos y Condiciones</CardTitle>
            <CardDescription>
              Por favor lea y acepte los términos del convenio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Terms and conditions text */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="mb-4">Autorización de Uso de Datos de Consumo</h3>
              
              <p className="mb-4">
                Yo, <strong>{formData.nombre}</strong>, en representación de la empresa identificada con RUT <strong>{formData.rut}</strong>, 
                autorizo expresamente a las empresas participantes del presente convenio a:
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2">1. Recopilación y Almacenamiento de Datos</h4>
                  <p>
                    Recopilar, almacenar y procesar los datos de consumo de servicios básicos (agua, electricidad y gas) 
                    correspondientes a nuestra empresa, con el propósito exclusivo de participar en el programa de descuentos y beneficios.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2">2. Uso de la Información</h4>
                  <p>
                    Utilizar dicha información para:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Calcular y aplicar descuentos correspondientes</li>
                    <li>Generar análisis de consumo, recomendaciones de eficiencia y generar conciencia</li>
                    <li>Enviar comunicaciones sobre promociones y beneficios exclusivos</li>
                    <li>Elaborar estudios de mercado y estadísticas agregadas y anónimas</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2">3. Protección de Datos</h4>
                  <p>
                    Los datos serán tratados conforme a la legislación vigente sobre protección de datos personales. 
                    Las empresas se comprometen a implementar medidas de seguridad apropiadas para proteger la información.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2">4. Vigencia y Revocación</h4>
                  <p>
                    Esta autorización tendrá una vigencia de 12 meses desde la fecha de aceptación, renovable automáticamente. 
                    El autorizador podrá revocar este consentimiento en cualquier momento mediante solicitud escrita.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2">5. Empresas Participantes</h4>
                  <p>
                    Este convenio es promovido conjuntamente por las tres empresas que auspician este beneficio: Santander, Imelsa y Bmatch.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-muted-foreground">
                Fecha de actualización: 19 de noviembre de 2025
              </p>
            </div>

            {/* Acceptance checkbox */}
            <div className="flex items-start space-x-3 bg-white border border-border rounded-lg p-4">
              <Checkbox
                id="terms"
                checked={formData.aceptaTerminos}
                onCheckedChange={(checked) => handleInputChange('aceptaTerminos', checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Acepto los términos y condiciones del convenio de descuentos y autorizo el uso de los datos de consumo de servicios básicos según lo establecido.
              </label>
            </div>

            {/* Electronic signature */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico (Firma Electrónica)</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-input-background"
              />
              <p className="text-muted-foreground">
                Al ingresar su correo electrónico, confirma su identidad y firma electrónicamente este documento
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Volver
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Enviar Consentimiento
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
