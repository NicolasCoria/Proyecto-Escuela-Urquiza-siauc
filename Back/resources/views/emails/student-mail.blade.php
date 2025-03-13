<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Approval Email</title>
</head>

<body>
    <div style="
        background-color: #dddddd;
        justify-content: space-between;
        text-align: center;
        border-radius: 10px;
      ">
        <div style="
          background-color: #757474;
          border-radius: 5px 5px 0 0;
          padding: 10px;
        ">
            <h2 style="font-weight: 600; color: #fff">Estimado {{ $name }}</h2>
        </div>
        <div style="padding: 20px; font-weight: 600; color: black">
            @if ($approved)
            <p>Felicidades , tu registro con el email {{$email}} ha sido aprobado.</p>
            <a href="https://urquiza-school.vercel.app/login" target='_blank' style="margin-top: 10px">Haz
                click aquí si
                deseas iniciar
                sesión</a>
            <p style="margin-top: 20px">Gracias por registrarte en nuestra plataforma.</p>
            @else
            <p>
                Lamentamos informarte que tu registro con el email {{$email}} ha sido rechazado. Por favor,
                comunicate con la institución al siguiente email:
                urquizaescuela@terciariourquiza.edu.ar
            </p>
            @endif

        </div>
        <img style="height: 350px; border-radius: 5px; margin-bottom: 20px"
            src="https://scontent.fros2-2.fna.fbcdn.net/v/t1.18169-9/29597510_10155509264402149_7415407965392304674_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=9a8829&_nc_ohc=keGgxWm7dD4AX_gxOCs&_nc_ht=scontent.fros2-2.fna&oh=00_AfBFOOT8ePBMLophOzb45C5lvvF8T4RKZsQ50bMoYXVyGQ&oe=65E08185"
            alt="" />
        <div style="
          background-color: #757474;
          border-radius: 0 0 5px 5px;
          font-weight: 500;
          color: white;
          padding: 10px;
        ">
            <p style="font-weight: 600; font-size: 20px">
                Escuela Superior J. J. Urquiza N°49
            </p>
        </div>
    </div>
</body>

</html>