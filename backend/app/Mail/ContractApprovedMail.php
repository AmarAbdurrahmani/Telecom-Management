<?php

namespace App\Mail;

use App\Models\Kontrate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContractApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Kontrate $kontrate) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Paketa juaj është aktivizuar — TelekomMS',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contract_approved',
        );
    }
}
