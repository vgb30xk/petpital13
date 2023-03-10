import { useState } from "react";
import styled from "styled-components";
import { authService } from "../firebase/firebase";
import CustomButton from "../components/custom/CustomButton";
import { emailRegex, pwRegex } from "../share/utils";
import {
  ButtonWrap,
  ErrorMessage,
  FormWrap,
  Input,
  ModalBackground,
  ModalWrap,
  OkMessage,
  Title,
} from "./login";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import AuthModal, { AuthTitle } from "../components/custom/AuthModal";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import Image from "next/image";
import loginLogo from "../../public/loginLogo.jpg";
import { BiArrowBack } from "react-icons/bi";

const Join = () => {
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const matchCheckEmail = email.match(emailRegex);
  const matchCheckPassword = password.match(pwRegex);
  const [joinFail, setJoinFail] = useState(false);
  const [joinComplete, setJoinComplete] = useState(false);
  const [joinAready, setJoinAready] = useState(false);

  const router = useRouter();

  const onSubmitJoin = async (event: any) => {
    event.preventDefault();

    await createUserWithEmailAndPassword(authService, email, password)
      .then(({ user }) => {
        setJoinComplete(true);
        updateProfile(user, {
          displayName: nick,
        });
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log("errorMessage:", errorMessage);
        if (errorMessage.includes("email-already-in-use")) {
          setJoinAready(true);
        }
        if (!email || !password) {
          setJoinFail(true);
        }
        if (password !== confirmpassword) {
          setJoinFail(true);
        }
      });

    setNick("");
    setEmail("");
    setPassword("");
    setConfirmpassword("");
  };

  const completeJoin = () => {
    setJoinComplete(false);
  };

  return (
    <ModalBackground>
      <ModalWrap>
        <BiArrowBack
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            cursor: "pointer",
          }}
          size="30"
          color="#15b5bf"
          onClick={() => {
            router.push("/");
          }}
        />
        <Image
          src={loginLogo}
          alt="loginLogo"
          width={170}
          height={40}
          style={{ marginBottom: 40 }}
        />
        <FormWrap onSubmit={onSubmitJoin}>
          <InputWrap>
            <LabelText>?????????</LabelText>
            <Input
              type="text"
              name={nick}
              placeholder="???????????? ????????? ?????????."
              value={nick}
              onChange={(e) => {
                const value = e.target.value;
                setNick(value);
              }}
              onKeyPress={(e) => {
                e.key === "Enter" && e.preventDefault();
              }}
            />
          </InputWrap>
          <InputWrap>
            <LabelText>?????????</LabelText>
            <Input
              type="text"
              name={email}
              placeholder="???????????? ????????? ?????????."
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
              }}
              onKeyPress={(e) => {
                e.key === "Enter" && e.preventDefault();
              }}
            />
            {!matchCheckEmail ? (
              email ? (
                <ErrorMessage>????????? ????????? ????????? ????????????.</ErrorMessage>
              ) : null
            ) : (
              <OkMessage>????????? ????????? ???????????????.</OkMessage>
            )}
          </InputWrap>

          <InputWrap>
            <LabelText>????????????</LabelText>
            <Input
              name={password}
              type="password"
              placeholder="??????????????? ????????? ?????????."
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
              }}
            />
            {!matchCheckPassword ? (
              password ? (
                <ErrorMessage>
                  ??????????????? 8?????? ?????? ?????????, ??????, ???????????? ???????????????
                  ?????????.
                </ErrorMessage>
              ) : null
            ) : (
              <OkMessage>????????? ?????????????????????</OkMessage>
            )}
          </InputWrap>

          <InputWrap>
            <LabelText>???????????? ??????</LabelText>
            <Input
              name={password}
              type="password"
              placeholder="??????????????? ????????? ?????????."
              value={confirmpassword}
              onChange={(e) => {
                const value = e.target.value;
                setConfirmpassword(value);
              }}
            />
            {password !== confirmpassword ? (
              <ErrorMessage>??????????????? ????????????.</ErrorMessage>
            ) : (
              confirmpassword && <OkMessage>????????? ???????????? ?????????.</OkMessage>
            )}
          </InputWrap>

          <ButtonWrap>
            <SignupButton type="submit">????????????</SignupButton>
          </ButtonWrap>
        </FormWrap>
      </ModalWrap>
      {joinAready && (
        <AuthModal>
          <AuthTitle>?????? ????????? ??????????????????.</AuthTitle>
          <p>?????? ????????? ??????????????????. ????????? ????????????.</p>
          <CustomButton
            bgColor="#444444"
            height={8}
            width={16}
            onClick={() => setJoinAready(false)}
          >
            ???????????????
          </CustomButton>
        </AuthModal>
      )}
      {joinFail && (
        <AuthModal>
          <AuthTitle>????????? ??? ????????????.</AuthTitle>
          <p>????????? ?????? ??????????????? ????????? ?????????.</p>
          <CustomButton
            bgColor="#444444"
            height={8}
            width={16}
            onClick={() => setJoinFail(false)}
          >
            ???????????????
          </CustomButton>
        </AuthModal>
      )}
      {joinComplete && (
        <AuthModal>
          <AuthTitle>????????????</AuthTitle>
          <p>??????????????? ?????????????????????.</p>
          <CustomButton
            bgColor="#15b5bf"
            height={8}
            width={16}
            onClick={() => {
              router.push("/");
            }}
          >
            ??????
          </CustomButton>
        </AuthModal>
      )}
    </ModalBackground>
  );
};

export default Join;

const InputWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 8px 0;
  padding: 0 20px;
`;

const LabelText = styled.div`
  font-size: 14px;
  padding: 0 8px;
  font-weight: 700;
`;

export const SignupButton = styled.button`
  flex: 1;
  cursor: pointer;
  background: #15b5bf;
  color: #fff;
  padding: 15px;
  border-style: none;
  border-radius: 5px;
  font-size: 15px;
  font-weight: 600;
  margin: 20px 25px 0 25px;
`;
