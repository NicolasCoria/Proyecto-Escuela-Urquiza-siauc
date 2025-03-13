<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;


class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;
    public $resetLink;
    public $name;
    

    public function __construct($resetLink, $name)
    {
        $this->resetLink = $resetLink;
        $this->name = $name;
       
    }

    public function build()
    {
        
        return $this->subject("Reestablecimiento de contraseña")
            ->view('emails.mail-reset-password');
    }
}
