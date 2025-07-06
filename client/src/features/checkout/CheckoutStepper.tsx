import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Paper,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import {
    AddressElement,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import Review from "./Review";
import {
    useFetchAddressQuery,
    useUpdateUserAddressMutation,
} from "../account/accountApi";
import type {
    ConfirmationToken,
    StripeAddressElementChangeEvent,
    StripePaymentElementChangeEvent,
} from "@stripe/stripe-js";
import { useBasket } from "../../lib/hooks/useBasket";
import { currencyFormat } from "../../lib/util";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../orders/orderApi";

const steps = ["Địa chỉ", "Thanh toán", "Xem lại"];

export default function CheckoutStepper() {
    const stripe = useStripe();
    const [activeStep, setActiveStep] = useState(0);
    const [createOrder] = useCreateOrderMutation();
    const { data, isLoading } = useFetchAddressQuery();
    const [updateAddress] = useUpdateUserAddressMutation();
    const [saveAddressChecked, setSaveAddressChecked] = useState(false);
    const elements = useElements();
    const [addressComplete, setAddressComplete] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { total, basket, clearBasket } = useBasket();
    const navigate = useNavigate();
    const [confirmationToken, setConfirmationToken] =
        useState<ConfirmationToken | null>(null);

    let name, restAddress;

    if (data) {
        ({ name, ...restAddress } = data);
    }

    const handleNext = async () => {
        if (activeStep === 0 && saveAddressChecked && elements) {
            const address = await getStripeAddress(); // lấy dữ liệu input từ form address
            if (address) await updateAddress(address);
        }

        //tạo confirmation token
        if (activeStep === 1) {
            if (!elements || !stripe) return; // return nếu cả 2 chưa sằn
            const result = await elements.submit(); //gửi dữ liệu từ element để validate
            if (result.error) return toast.error(result.error.message);

            const stripeResult = await stripe.createConfirmationToken({
                elements,
            }); // truyền elements để tạo confirmation token
            if (stripeResult.error) {
                return toast.error(stripeResult.error.message);
            }

            setConfirmationToken(stripeResult.confirmationToken); // thành công thì lưu vào state
        }
        if (activeStep === 2) {
            await confirmPayment();
        }
        if (activeStep < 2) setActiveStep((step) => step + 1);
    };

    const confirmPayment = async () => {
        setSubmitting(true); // disable nút bấm
        try {
            if (!confirmPayment || !basket?.clientSecret)
                throw new Error("Không thể xử lý thanh toán");

            const orderModel = await createOrderModel(); // lấy object chứa shipping và payment infor
            const orderResult = await createOrder(orderModel); // gọi api tạo order

            const paymentResult = await stripe?.confirmPayment({
                clientSecret: basket.clientSecret,
                redirect: "if_required",
                confirmParams: {
                    confirmation_token: confirmationToken?.id,
                },
            }); //confirm payment

            if (paymentResult?.paymentIntent?.status === "succeeded") {
                navigate("/checkout/success", { state: orderResult }); // thành công thì chuyển hướng trang
                clearBasket(); // xóa cookie basket, và mutation cache basket items
            } else if (paymentResult?.error) {
                throw new Error(paymentResult.error.message);
            } else {
                throw new Error("Xảy ra lỗi");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
            setActiveStep((step) => step - 1); // quay lại step trước đó nếu có lỗi
        } finally {
            setSubmitting(false); // không disable nút bấm nữa
        }
    };

    const createOrderModel = async () => {
        const shippingAddress = await getStripeAddress();
        const paymentSummary = confirmationToken?.payment_method_preview.card;

        if (!shippingAddress || !paymentSummary)
            throw new Error("Có lỗi khi tạo order");

        return { shippingAddress, paymentSummary };
    };

    const getStripeAddress = async () => {
        const addressElement = elements?.getElement("address");
        if (!addressElement) return null;

        const {
            value: { name, address },
        } = await addressElement.getValue();

        if (name && address) return { ...address, name };

        return null;
    };

    const handleBack = () => {
        setActiveStep((step) => (step === 0 ? 0 : step - 1));
    };

    const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
        setAddressComplete(event.complete);
    };

    const handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
        setPaymentComplete(event.complete);
    };

    if (isLoading) return <Typography variant="h6">Đang tải...</Typography>;

    return (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    return (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            <Box marginTop={2}>
                <Box display={activeStep === 0 ? "block" : "none"}>
                    <AddressElement
                        options={{
                            mode: "shipping",
                            defaultValues: {
                                name: name,
                                address: restAddress,
                            },
                        }}
                        onChange={handleAddressChange}
                    />
                    <FormControlLabel
                        sx={{ display: "flex", justifyContent: "end" }}
                        control={
                            <Checkbox
                                checked={saveAddressChecked}
                                onChange={(e) =>
                                    setSaveAddressChecked(e.target.checked)
                                }
                            />
                        }
                        label="Lưu làm địa chỉ mặc định"
                    />
                </Box>
                <Box display={activeStep === 1 ? "block" : "none"}>
                    <PaymentElement
                        onChange={handlePaymentChange}
                        options={{
                            wallets: { applePay: "never", googlePay: "never" },
                        }}
                    />
                </Box>
                <Box display={activeStep === 2 ? "block" : "none"}>
                    <Review confirmationToken={confirmationToken} />
                </Box>
            </Box>

            <Box display="flex" marginTop={2} justifyContent="space-between">
                <Button onClick={handleBack}>Quay lại</Button>
                <Button
                    onClick={handleNext}
                    disabled={
                        (activeStep === 0 && !addressComplete) ||
                        (activeStep === 1 && !paymentComplete) ||
                        submitting
                    }
                    loading={submitting}
                >
                    {activeStep === steps?.length - 1
                        ? `Thanh toán ${currencyFormat(total)}`
                        : "Tiếp theo"}
                </Button>
            </Box>
        </Paper>
    );
}
